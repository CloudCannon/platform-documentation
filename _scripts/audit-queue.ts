// Audit queue: derive the next batch of pages to audit from git history,
// changelog activity, frontmatter, and the config in audit-config.yml.
// See .claude/plans/content-audit-mega.plan.md for the framework.

import { parse as parseYaml } from "jsr:@std/yaml";
import { walk } from "jsr:@std/fs/walk";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { dirname, fromFileUrl, relative, resolve } from "jsr:@std/path";

type Priority = "P0" | "P1" | "P2" | "P3";

interface Config {
  app_repo_path?: string;
  scope: string[];
  substantive_edit_threshold_lines: number;
  non_substantive_commit_patterns: string[];
  skip_commit_date_ranges: Array<{ start: string; end: string; reason?: string }>;
  staleness: { severe_months: number; moderate_months: number; recent_months: number };
  changelogs_root: string;
  changelog_lookback_months: number;
  changelog_pressure_stopwords?: string[];
  high_stakes_seeds: string[];
  absorbed_plans: {
    net_new: string[];
    pre_scheduled_fix: string[];
    externally_coupled: string[];
  };
  pre_scheduled_pages: Record<string, string>;
  externally_coupled_pages: Record<string, string>;
}

interface AuditFrontmatter {
  last_reviewed?: string;
  app_sha?: string;
  factual?: "ok" | "stale" | "needs_check";
  persona?: "ok" | "wrong_audience" | "gap" | "split_needed";
  style?: "ok" | "needs_update";
  ui?: "ok" | "stale";
  priority?: Priority;
  notes?: string;
}

type PlanKind = "pre_scheduled_fix" | "externally_coupled";

interface PageInfo {
  path: string;
  section: string;
  title: string;
  lastSubstantiveEdit: string | null;
  monthsSinceSubstantive: number | null;
  highStakes: boolean;
  highStakesMatches: string[];
  changelogPressure: boolean;
  changelogTopics: string[];
  audited: boolean;
  needsTriage: boolean;
  audit: AuditFrontmatter;
  planTag: { kind: PlanKind; plan: string } | null;
  priority: Priority;
  rationale: string[];
  nextReview: string | null;
  standingFlags: string[];
  driftSinceReview: { count: number; lastDate: string } | null;
}

const repoRoot = resolve(dirname(fromFileUrl(import.meta.url)), "..");

// Verifies the app/ repo exists, is on main, and returns its short HEAD SHA.
// Auditors use app/ as ground truth for the factual lens, so feature-branch
// state must not leak into audits.
async function checkAppRepoOnMain(appRoot: string): Promise<string> {
  try {
    const stat = await Deno.stat(appRoot);
    if (!stat.isDirectory) {
      throw new Error(`expected directory at ${appRoot}`);
    }
  } catch {
    console.error(`audit-queue: app repo not found at ${appRoot}.`);
    console.error("Auditors verify factual claims against app/ on main.");
    console.error("Clone or check out the app repo there and re-run.");
    Deno.exit(2);
  }
  const branchCmd = new Deno.Command("git", {
    args: ["-C", appRoot, "branch", "--show-current"],
    stdout: "piped",
    stderr: "null",
  });
  const { stdout: branchOut } = await branchCmd.output();
  const branch = new TextDecoder().decode(branchOut).trim();
  if (branch !== "main") {
    console.error(`audit-queue: app repo is on '${branch}', not 'main'.`);
    console.error("Switch to main before running the audit so factual checks use released code.");
    Deno.exit(2);
  }
  // Refresh origin/main. Soft-fail if offline so the script still works on a
  // train; hard-fail below if origin/main turns out to be ahead.
  const fetchCmd = new Deno.Command("git", {
    args: ["-C", appRoot, "fetch", "origin", "main", "--quiet"],
    stdout: "null",
    stderr: "piped",
  });
  const fetchResult = await fetchCmd.output();
  if (!fetchResult.success) {
    const err = new TextDecoder().decode(fetchResult.stderr).trim();
    console.error(`audit-queue: warning — could not fetch from origin (${err || "unknown error"}). Using last-known refs.`);
  }
  const behindCmd = new Deno.Command("git", {
    args: ["-C", appRoot, "rev-list", "--count", "HEAD..origin/main"],
    stdout: "piped",
    stderr: "null",
  });
  const { stdout: behindOut } = await behindCmd.output();
  const behind = parseInt(new TextDecoder().decode(behindOut).trim()) || 0;
  if (behind > 0) {
    console.error(`audit-queue: app/main is ${behind} commit(s) behind origin/main.`);
    console.error("Pull before running the audit so factual checks use the latest released code.");
    Deno.exit(2);
  }
  const shaCmd = new Deno.Command("git", {
    args: ["-C", appRoot, "rev-parse", "--short", "HEAD"],
    stdout: "piped",
    stderr: "null",
  });
  const { stdout: shaOut } = await shaCmd.output();
  return new TextDecoder().decode(shaOut).trim();
}

async function loadConfig(): Promise<Config> {
  const path = resolve(repoRoot, "_scripts/audit-config.yml");
  const text = await Deno.readTextFile(path);
  return parseYaml(text) as Config;
}

function splitFrontmatter(content: string): { fm: string; body: string } {
  if (!content.startsWith("---\n")) return { fm: "", body: content };
  const end = content.indexOf("\n---", 4);
  if (end === -1) return { fm: "", body: content };
  return { fm: content.slice(4, end), body: content.slice(end + 4) };
}

function getAuditFields(fm: Record<string, unknown>): AuditFrontmatter {
  const an = (fm.author_notes ?? {}) as Record<string, unknown>;
  const out: AuditFrontmatter = {};
  for (const k of ["last_reviewed", "app_sha", "factual", "persona", "style", "ui", "priority", "notes"] as const) {
    const v = an[k];
    if (v === undefined) continue;
    // YAML parses unquoted ISO dates as Date objects — normalise to YYYY-MM-DD
    // so downstream string-comparisons (e.g. drift checks) are safe.
    if (v instanceof Date && !isNaN(v.getTime())) {
      (out as Record<string, unknown>)[k] = toIsoDate(v);
    } else {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

function dateInRanges(iso: string, ranges: Array<{ start: string; end: string }>): boolean {
  return ranges.some((r) => iso >= r.start && iso <= r.end);
}

// Streams (path, date) pairs from a `git log --numstat` output, applying the
// substantive-edit threshold and the skip rules. Stop the stream early by
// returning `true` from `onCommit`. Shared between the bulk multi-path pass
// and the per-file `--follow` recovery pass — keeping skip semantics in one
// place stops the two passes drifting apart.
function streamSubstantiveCommits(
  logText: string,
  threshold: number,
  skipPatterns: RegExp[],
  skipRanges: Array<{ start: string; end: string }>,
  onCommit: (path: string, date: string) => boolean | void,
): void {
  let currentDate: string | null = null;
  let currentSkip = false;
  for (const line of logText.split("\n")) {
    if (line.startsWith("COMMIT|")) {
      const parts = line.split("|");
      currentDate = parts[2] ?? null;
      const subject = parts.slice(3).join("|");
      const dateSkip = currentDate ? dateInRanges(currentDate, skipRanges) : false;
      const patternSkip = skipPatterns.some((re) => re.test(subject));
      currentSkip = dateSkip || patternSkip;
      continue;
    }
    if (!line.trim() || !currentDate || currentSkip) continue;
    const cols = line.split("\t");
    if (cols.length !== 3) continue;
    const added = cols[0] === "-" ? 0 : parseInt(cols[0]);
    const deleted = cols[1] === "-" ? 0 : parseInt(cols[1]);
    if (added + deleted < threshold) continue;
    if (onCommit(cols[2], currentDate) === true) return;
  }
}

// One bulk git log call instead of per-file --follow — saves ~378 subprocess
// spawns. The trade-off is that `--follow` doesn't work with multi-path log,
// so files renamed during the 2025 redesign lose their pre-rename history
// here; recoverRenameHistory picks those up.
// Returns per-path lists of substantive commit dates, sorted newest-first.
// The first element is "last substantive edit"; the full list drives drift
// detection ("how many substantive commits since last_reviewed").
async function loadSubstantiveCommits(
  scope: string[],
  threshold: number,
  skipPatterns: RegExp[],
  skipRanges: Array<{ start: string; end: string }>,
): Promise<Map<string, string[]>> {
  const cmd = new Deno.Command("git", {
    args: ["log", "--numstat", "--pretty=format:COMMIT|%H|%ad|%s", "--date=short", "--", ...scope],
    cwd: repoRoot,
    stdout: "piped",
    stderr: "null",
  });
  const { stdout } = await cmd.output();
  const text = new TextDecoder().decode(stdout);
  const commits = new Map<string, string[]>();
  streamSubstantiveCommits(text, threshold, skipPatterns, skipRanges, (path, date) => {
    const list = commits.get(path);
    if (list) list.push(date);
    else commits.set(path, [date]);
  });
  return commits;
}

// Per-file `--follow` recovery for paths the bulk pass missed. Spawns one git
// subprocess per file; only called for the small set of unresolved paths.
async function recoverRenameHistory(
  path: string,
  threshold: number,
  skipPatterns: RegExp[],
  skipRanges: Array<{ start: string; end: string }>,
): Promise<string | null> {
  const cmd = new Deno.Command("git", {
    args: ["log", "--follow", "--numstat", "--pretty=format:COMMIT|%H|%ad|%s", "--date=short", "--", path],
    cwd: repoRoot,
    stdout: "piped",
    stderr: "null",
  });
  const { stdout } = await cmd.output();
  const text = new TextDecoder().decode(stdout);
  let first: string | null = null;
  streamSubstantiveCommits(text, threshold, skipPatterns, skipRanges, (_p, date) => {
    first = date;
    return true;
  });
  return first;
}

function monthsSince(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

// Reads a "Next review: YYYY-MM-DD" hint out of the free-text notes field
// (case-insensitive). Notes is a free-form string by design — keeping the
// hint here avoids inventing a frontmatter key for a per-page exception.
function parseNextReview(notes: string | undefined): string | null {
  if (!notes) return null;
  const m = notes.match(/next review[:\s]+(\d{4}-\d{2}-\d{2})/i);
  return m ? m[1] : null;
}

// Standing checks re-surface audited pages whose state has stopped matching
// reality. Two signals: substantive commits since review (drift), and a
// re-review interval that has expired (either per-page hint or 12mo default).
function computeStandingChecks(
  audit: AuditFrontmatter,
  commitDates: string[],
  nextReview: string | null,
): { flags: string[]; drift: { count: number; lastDate: string } | null } {
  const flags: string[] = [];
  let drift: { count: number; lastDate: string } | null = null;
  if (!audit.last_reviewed) return { flags, drift };
  const driftDates = commitDates.filter((d) => d > audit.last_reviewed!);
  if (driftDates.length > 0) {
    drift = { count: driftDates.length, lastDate: driftDates[0] };
    flags.push(`${driftDates.length} substantive commit(s) since last review (latest ${driftDates[0]})`);
  }
  if (nextReview) {
    if (isoToday() >= nextReview) flags.push(`re-review due (notes said ${nextReview})`);
  } else {
    const months = monthsSince(audit.last_reviewed);
    if (months !== null && months >= 12) {
      flags.push(`reviewed ${months} months ago (>12mo default interval)`);
    }
  }
  return { flags, drift };
}

function findSeedMatches(haystackLower: string, seedsLower: string[], seeds: string[]): string[] {
  return seeds.filter((_, i) => haystackLower.includes(seedsLower[i]));
}

function dateFromChangelogPath(path: string): string | null {
  const m = path.match(/changelogs\/(\d{4})\/(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isoToday(): string {
  return toIsoDate(new Date());
}

function isoMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return toIsoDate(d);
}

async function loadChangelogBlob(config: Config): Promise<string> {
  const dir = resolve(repoRoot, config.changelogs_root);
  const cutoff = isoMonthsAgo(config.changelog_lookback_months);
  const chunks: string[] = [];
  try {
    for await (const entry of walk(dir, { exts: [".mdx", ".md"] })) {
      const rel = relative(repoRoot, entry.path);
      const entryDate = dateFromChangelogPath(rel);
      if (!entryDate || entryDate < cutoff) continue;
      const content = await Deno.readTextFile(entry.path);
      const { fm, body } = splitFrontmatter(content);
      if (fm) {
        const parsed = parseYaml(fm) as Record<string, unknown>;
        if (typeof parsed.title === "string") chunks.push(parsed.title);
      }
      chunks.push(body);
    }
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) throw e;
  }
  return chunks.join("\n").toLowerCase();
}

function changelogPressureForPage(
  matchedSeedsLower: string[],
  haystackLower: string,
  blobLower: string,
  stopwords: Set<string>,
): { hit: boolean; topics: string[] } {
  if (!blobLower) return { hit: false, topics: [] };
  const hits = new Set<string>();
  for (const s of matchedSeedsLower) {
    if (blobLower.includes(s)) hits.add(s);
  }
  for (const word of haystackLower.split(/[\s\-/_,.]+/).filter((w) => w.length >= 5)) {
    if (stopwords.has(word)) continue;
    if (blobLower.includes(word)) hits.add(word);
  }
  return { hit: hits.size > 0, topics: [...hits].slice(0, 4) };
}

function sectionOf(path: string): string {
  const parts = path.split("/");
  if (parts.length < 3) return parts[0] ?? "";
  if (parts[1] === "guides") return `${parts[0]}/guides/${parts[2]}`;
  return `${parts[0]}/${parts[1]}`;
}

function planTagFor(path: string, config: Config): PageInfo["planTag"] {
  if (config.pre_scheduled_pages[path]) return { kind: "pre_scheduled_fix", plan: config.pre_scheduled_pages[path] };
  if (config.externally_coupled_pages[path]) return { kind: "externally_coupled", plan: config.externally_coupled_pages[path] };
  return null;
}

function computePriority(page: PageInfo, config: Config): void {
  if (page.audited) {
    page.priority = page.audit.priority ?? "P2";
    page.rationale = ["already audited"];
    return;
  }
  if (page.audit.priority) {
    page.priority = page.audit.priority;
    page.rationale = ["frontmatter override"];
    return;
  }
  const months = page.monthsSinceSubstantive;
  const staleSevere = months !== null && months >= config.staleness.severe_months;
  const staleMod = months !== null && months >= config.staleness.moderate_months;

  const reasons: string[] = [];
  if (page.needsTriage) reasons.push("NEW (priority key empty)");
  if (page.highStakes) reasons.push(`high-stakes (${page.highStakesMatches.slice(0, 2).join(", ")})`);
  if (page.changelogPressure) reasons.push(`changelog activity (last ${config.changelog_lookback_months}mo)`);
  if (months === null) reasons.push("no substantive edit on record");
  else if (staleSevere) reasons.push(`stale >${config.staleness.severe_months}mo`);
  else if (staleMod) reasons.push(`stale ≥${config.staleness.moderate_months}mo`);

  if (page.highStakes && (page.changelogPressure || staleSevere || months === null)) {
    page.priority = "P0";
  } else if (
    (page.highStakes && staleMod) ||
    (page.changelogPressure && staleMod) ||
    (page.highStakes && months === null)
  ) {
    page.priority = "P1";
  } else if (staleMod || months === null) {
    page.priority = "P2";
  } else {
    page.priority = "P3";
  }
  page.rationale = reasons;
}

async function collectPages(config: Config, changelogBlob: string): Promise<{ pages: PageInfo[]; parseErrors: Array<{ path: string; message: string }> }> {
  const pages: PageInfo[] = [];
  const skipPatterns = (config.non_substantive_commit_patterns ?? []).map(
    (p) => new RegExp(p, "i"),
  );
  const skipRanges = config.skip_commit_date_ranges ?? [];
  const seedsLower = config.high_stakes_seeds.map((s) => s.toLowerCase());
  const stopwords = new Set((config.changelog_pressure_stopwords ?? []).map((w) => w.toLowerCase()));
  const parseErrors: Array<{ path: string; message: string }> = [];
  const commitsMap = await loadSubstantiveCommits(
    config.scope,
    config.substantive_edit_threshold_lines,
    skipPatterns,
    skipRanges,
  );

  for (const root of config.scope) {
    const absRoot = resolve(repoRoot, root);
    try {
      for await (const entry of walk(absRoot, { exts: [".mdx", ".md"], includeDirs: false })) {
        const rel = relative(repoRoot, entry.path);
        const content = await Deno.readTextFile(entry.path);
        const { fm } = splitFrontmatter(content);
        let parsed: Record<string, unknown> = {};
        if (fm) {
          try {
            parsed = parseYaml(fm) as Record<string, unknown>;
          } catch (e) {
            // Recorded for main() to surface. Silently skipping unparseable
            // pages would hide audit-state bugs (they'd look unaudited).
            const message = e instanceof Error ? e.message.split("\n")[0] : String(e);
            parseErrors.push({ path: rel, message });
          }
        }
        const audit = getAuditFields(parsed);
        const authorNotes = (parsed.author_notes ?? {}) as Record<string, unknown>;
        const needsTriage = "priority" in authorNotes && !audit.priority;
        const title = (((parsed.details as Record<string, unknown>) ?? {}).title as string) ?? rel;
        const commitDates = commitsMap.get(rel) ?? [];
        let lastSub = commitDates[0] ?? null;
        // If frontmatter _created_at is newer than git's last-substantive date,
        // prefer it. This catches files that were rewritten/recreated where
        // --follow walks back into pre-rewrite history that no longer applies.
        // YAML parses ISO dates into Date objects; raw quoted strings stay as strings.
        const createdRaw = parsed._created_at;
        let createdAt: string | null = null;
        if (createdRaw instanceof Date && !isNaN(createdRaw.getTime())) {
          createdAt = createdRaw.toISOString().slice(0, 10);
        } else if (typeof createdRaw === "string") {
          createdAt = createdRaw.slice(0, 10);
        }
        if (createdAt && (!lastSub || createdAt > lastSub)) {
          lastSub = createdAt;
        }
        const haystackLower = `${rel} ${title}`.toLowerCase();
        const matches = findSeedMatches(haystackLower, seedsLower, config.high_stakes_seeds);
        const matchesLower = matches.map((m) => m.toLowerCase());
        const pressure = changelogPressureForPage(matchesLower, haystackLower, changelogBlob, stopwords);

        const nextReview = parseNextReview(audit.notes);
        const { flags: standingFlags, drift: driftSinceReview } = computeStandingChecks(audit, commitDates, nextReview);

        const page: PageInfo = {
          path: rel,
          section: sectionOf(rel),
          title,
          lastSubstantiveEdit: lastSub,
          monthsSinceSubstantive: monthsSince(lastSub),
          highStakes: matches.length > 0,
          highStakesMatches: matches,
          changelogPressure: pressure.hit,
          changelogTopics: pressure.topics,
          audited: !!audit.last_reviewed,
          needsTriage,
          audit,
          planTag: planTagFor(rel, config),
          priority: "P3",
          rationale: [],
          nextReview,
          standingFlags,
          driftSinceReview,
        };
        computePriority(page, config);
        pages.push(page);
      }
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) throw e;
    }
  }

  const needsRecovery = pages.filter((p) => p.lastSubstantiveEdit === null);
  const recovered = await Promise.all(
    needsRecovery.map((p) =>
      recoverRenameHistory(p.path, config.substantive_edit_threshold_lines, skipPatterns, skipRanges),
    ),
  );
  for (let i = 0; i < needsRecovery.length; i++) {
    const date = recovered[i];
    if (date) {
      const p = needsRecovery[i];
      p.lastSubstantiveEdit = date;
      p.monthsSinceSubstantive = monthsSince(date);
      computePriority(p, config);
    }
  }

  return { pages, parseErrors };
}

function currentPhase(pages: PageInfo[]): { phase: number; label: string } {
  const queue = pages.filter((p) => !p.audited && !p.planTag);
  const p0 = queue.filter((p) => p.priority === "P0").length;
  const p1 = queue.filter((p) => p.priority === "P1").length;
  const p0Unconfirmed = queue.filter((p) => p.priority === "P0" && !p.audit.priority).length;

  if (p0Unconfirmed > 0) return { phase: 1, label: "Phase 1 — script + P0 confirmation" };
  if (p0 > 0) return { phase: 2, label: "Phase 2 — P0 audit" };
  if (p1 > 0) return { phase: 3, label: "Phase 3 — P1 audit" };
  return { phase: 4, label: "Phase 4 — P2 sweep" };
}

const PHASE_TO_PRIORITY: Record<string, Priority> = { "1": "P0", "2": "P0", "3": "P1", "4": "P2" };

function printHuman(pages: PageInfo[], args: { phase?: string; section?: string; batch?: string }) {
  const total = pages.length;
  const audited = pages.filter((p) => p.audited).length;
  const counts: Record<Priority, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  const confirmed: Record<Priority, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const p of pages.filter((x) => !x.audited && !x.planTag)) {
    counts[p.priority]++;
    if (p.audit.priority) confirmed[p.priority]++;
  }

  const { phase, label } = currentPhase(pages);
  const targetPriority: Priority = PHASE_TO_PRIORITY[args.phase ?? String(phase)] ?? "P0";

  const batchSize = args.batch ? parseInt(args.batch) : 40;
  let queue = pages
    .filter((p) => !p.audited && !p.planTag && p.priority === targetPriority);
  if (args.section) queue = queue.filter((p) => p.section.startsWith(args.section!));
  if (phase === 1) {
    queue = queue.filter((p) => !p.audit.priority);
  }
  queue.sort((a, b) => {
    if (a.needsTriage !== b.needsTriage) return a.needsTriage ? -1 : 1;
    return (b.monthsSinceSubstantive ?? 99) - (a.monthsSinceSubstantive ?? 99);
  });

  const needsTriage = pages.filter((p) => p.needsTriage && !p.audited && !p.planTag).length;
  console.log(`Phase: ${phase} (${label})`);
  console.log(`Audited so far: ${audited}/${total}`);
  if (needsTriage > 0) console.log(`Needs triage: ${needsTriage} new pages with empty priority key`);
  console.log(`Queue: P0 ${counts.P0} (${confirmed.P0} confirmed)  P1 ${counts.P1} (${confirmed.P1} confirmed)  P2 ${counts.P2}  P3 ${counts.P3}`);
  const skipped = pages.filter((p) => p.planTag);
  if (skipped.length > 0) console.log(`Plan-owned (skipped): ${skipped.length}`);
  console.log("");
  if (queue.length === 0) {
    console.log(`No ${targetPriority} pages outstanding for the current scope.`);
  } else {
    const action = phase === 1 ? "skim (~2 min/page)" : "audit";
    const batch = queue.slice(0, batchSize);
    console.log(`Next batch (${targetPriority}, ${batch.length} of ${queue.length} remaining, suggested ${action}):`);
    for (let i = 0; i < batch.length; i++) {
      const p = batch[i];
      const ageStr = p.lastSubstantiveEdit ? `last sub-edit ${p.lastSubstantiveEdit}` : "no substantive edits";
      console.log(`${String(i + 1).padStart(3, " ")}. ${p.path}`);
      console.log(`     Reason: ${p.rationale.join("; ")} | ${ageStr}`);
    }
  }

  // Standing checks: audited pages whose world has moved on. Surfaced after
  // the main batch so they don't compete with first-time priorities, but
  // visible every run so re-review work doesn't silently rot.
  const standing = pages.filter((p) => p.audited && p.standingFlags.length > 0);
  if (standing.length > 0) {
    standing.sort((a, b) => {
      const ad = a.driftSinceReview?.count ?? 0;
      const bd = b.driftSinceReview?.count ?? 0;
      if (ad !== bd) return bd - ad;
      return (a.audit.last_reviewed ?? "").localeCompare(b.audit.last_reviewed ?? "");
    });
    const shown = standing.slice(0, 10);
    console.log("");
    console.log(`Standing checks (${standing.length}): audited pages flagged for re-review`);
    for (const p of shown) {
      const reviewed = p.audit.last_reviewed ? `reviewed ${p.audit.last_reviewed}` : "no review date";
      console.log(`  ${p.path}  [${reviewed}]`);
      for (const flag of p.standingFlags) console.log(`     ${flag}`);
    }
    if (standing.length > shown.length) console.log(`  …and ${standing.length - shown.length} more`);
  }
}

function explainPage(pages: PageInfo[], target: string, config: Config) {
  const norm = (s: string) => s.replace(/^\.\//, "").replace(/^\/+/, "");
  const p = pages.find((x) => norm(x.path) === norm(target) || x.path.endsWith(norm(target)));
  if (!p) {
    console.error(`audit-queue: no page matched '${target}'.`);
    Deno.exit(2);
    return;
  }
  console.log(`Path: ${p.path}`);
  console.log(`Title: ${p.title}`);
  console.log(`Section: ${p.section}`);
  console.log(`Priority: ${p.priority}${p.audit.priority ? " (from frontmatter)" : " (derived)"}`);
  console.log(`Rationale: ${p.rationale.join("; ") || "(none)"}`);
  console.log("");
  console.log("Signals:");
  console.log(`  Last substantive edit: ${p.lastSubstantiveEdit ?? "no record"}`);
  console.log(`  Months since: ${p.monthsSinceSubstantive ?? "n/a"}`);
  console.log(`  Staleness thresholds: severe ≥${config.staleness.severe_months}mo, moderate ≥${config.staleness.moderate_months}mo`);
  console.log(`  High-stakes seeds matched: ${p.highStakesMatches.join(", ") || "none"}`);
  console.log(`  Changelog pressure: ${p.changelogPressure ? p.changelogTopics.join(", ") : "no"} (lookback ${config.changelog_lookback_months}mo)`);
  console.log(`  Plan-owned: ${p.planTag ? `${p.planTag.kind} / ${p.planTag.plan}` : "no"}`);
  console.log("");
  console.log("Audit state:");
  console.log(`  Audited: ${p.audited ? "yes" : "no"}`);
  if (p.audit.last_reviewed) console.log(`  Last reviewed: ${p.audit.last_reviewed}`);
  if (p.audit.app_sha) console.log(`  App SHA at review: ${p.audit.app_sha}`);
  if (p.nextReview) console.log(`  Next review hint (from notes): ${p.nextReview}`);
  if (p.audit.factual) console.log(`  Factual verdict: ${p.audit.factual}`);
  if (p.audit.persona) console.log(`  Persona verdict: ${p.audit.persona}`);
  if (p.audit.style) console.log(`  Style verdict: ${p.audit.style}`);
  if (p.audit.ui) console.log(`  UI verdict: ${p.audit.ui}`);
  if (p.driftSinceReview) {
    console.log(`  Drift: ${p.driftSinceReview.count} substantive commit(s) since review (latest ${p.driftSinceReview.lastDate})`);
  }
  if (p.standingFlags.length > 0) {
    console.log("");
    console.log("Standing-check flags:");
    for (const f of p.standingFlags) console.log(`  - ${f}`);
  }
}

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["json"],
    string: ["phase", "section", "batch", "explain"],
  });
  const config = await loadConfig();
  const appRoot = resolve(repoRoot, config.app_repo_path ?? "../app");
  const appSha = await checkAppRepoOnMain(appRoot);
  const changelogBlob = await loadChangelogBlob(config);
  const { pages, parseErrors } = await collectPages(config, changelogBlob);

  if (parseErrors.length > 0) {
    console.error(`audit-queue: ${parseErrors.length} page(s) had unparseable frontmatter:`);
    for (const e of parseErrors.slice(0, 10)) console.error(`  ${e.path} — ${e.message}`);
    if (parseErrors.length > 10) console.error(`  …and ${parseErrors.length - 10} more`);
    console.error("Fix or rerun once parsed; broken frontmatter hides audit state.");
    Deno.exit(2);
  }

  const missingAppSha = pages.filter((p) => p.audited && !p.audit.app_sha);
  if (missingAppSha.length > 0) {
    console.error(`audit-queue: ${missingAppSha.length} audited page(s) missing required app_sha:`);
    for (const p of missingAppSha.slice(0, 10)) console.error(`  ${p.path}`);
    if (missingAppSha.length > 10) console.error(`  …and ${missingAppSha.length - 10} more`);
    Deno.exit(2);
  }

  if (args.explain) {
    console.log(`app repo: main @ ${appSha}`);
    console.log("");
    explainPage(pages, args.explain, config);
    return;
  }

  if (args.json) {
    console.log(JSON.stringify({ phase: currentPhase(pages), pages, appSha }, null, 2));
    return;
  }
  console.log(`app repo: main @ ${appSha}`);
  printHuman(pages, args);
}

if (import.meta.main) {
  await main();
}
