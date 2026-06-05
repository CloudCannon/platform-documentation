// Audit queue: derive the next batch of pages to audit from git history,
// changelog activity, frontmatter, and the config in audit-config.yml.
// See .claude/plans/content-audit-mega.plan.md for the framework.

import { parse as parseYaml } from "jsr:@std/yaml";
import { walk } from "jsr:@std/fs/walk";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { dirname, fromFileUrl, relative, resolve } from "jsr:@std/path";

type Priority = "P0" | "P1" | "P2" | "P3";

interface Config {
  scope: string[];
  substantive_edit_threshold_lines: number;
  non_substantive_commit_patterns: string[];
  skip_commit_date_ranges: Array<{ start: string; end: string; reason?: string }>;
  staleness: { severe_months: number; moderate_months: number; recent_months: number };
  changelogs_root: string;
  changelog_lookback_months: number;
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
  audited_at_sha?: string;
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
}

const repoRoot = resolve(dirname(fromFileUrl(import.meta.url)), "..");

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
  for (const k of ["last_reviewed", "audited_at_sha", "app_sha", "factual", "persona", "style", "ui", "priority", "notes"] as const) {
    if (an[k] !== undefined) (out as Record<string, unknown>)[k] = an[k];
  }
  return out;
}

function dateInRanges(iso: string, ranges: Array<{ start: string; end: string }>): boolean {
  return ranges.some((r) => iso >= r.start && iso <= r.end);
}

// One bulk git log call instead of per-file --follow. The trade-off is that
// renamed files lose their pre-rename history; for this audit's purposes
// that's acceptable since most renames happened during the skipped redesign
// window. Saves ~378 subprocess spawns per script invocation.
// Fast path: one bulk git log over all in-scope dirs. The trade-off is that
// `--follow` doesn't work with multi-path log, so files renamed during the
// 2025 redesign lose their pre-rename history here.
async function loadLastSubstantiveEdits(
  scope: string[],
  threshold: number,
  skipPatterns: RegExp[],
  skipRanges: Array<{ start: string; end: string }>,
): Promise<Map<string, string>> {
  const cmd = new Deno.Command("git", {
    args: ["log", "--numstat", "--pretty=format:COMMIT|%H|%ad|%s", "--date=short", "--", ...scope],
    cwd: repoRoot,
    stdout: "piped",
    stderr: "null",
  });
  const { stdout } = await cmd.output();
  const text = new TextDecoder().decode(stdout);
  const lastSub = new Map<string, string>();
  let currentDate: string | null = null;
  let currentSkip = false;
  for (const line of text.split("\n")) {
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
    const path = cols[2];
    if (added + deleted >= threshold && !lastSub.has(path)) {
      lastSub.set(path, currentDate);
    }
  }
  return lastSub;
}

// Recovery pass for files the bulk log returned null for. Runs `--follow` so
// rename chains are walked. Spawns one git subprocess per file; called only
// for the small set of unresolved paths to keep total runtime ~2s.
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
  let currentDate: string | null = null;
  let currentSkip = false;
  for (const line of text.split("\n")) {
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
    if (added + deleted >= threshold) return currentDate;
  }
  return null;
}

function monthsSince(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

function findSeedMatches(haystackLower: string, seedsLower: string[], seeds: string[]): string[] {
  return seeds.filter((_, i) => haystackLower.includes(seedsLower[i]));
}

function dateFromChangelogPath(path: string): string | null {
  const m = path.match(/changelogs\/(\d{4})\/(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function isoMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
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

function changelogPressureForPage(matchedSeedsLower: string[], haystackLower: string, blobLower: string): { hit: boolean; topics: string[] } {
  if (!blobLower) return { hit: false, topics: [] };
  const hits = new Set<string>();
  for (const s of matchedSeedsLower) {
    if (blobLower.includes(s)) hits.add(s);
  }
  for (const word of haystackLower.split(/[\s\-/_,.]+/).filter((w) => w.length >= 5)) {
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

async function collectPages(config: Config, changelogBlob: string): Promise<PageInfo[]> {
  const pages: PageInfo[] = [];
  const skipPatterns = (config.non_substantive_commit_patterns ?? []).map(
    (p) => new RegExp(p, "i"),
  );
  const skipRanges = config.skip_commit_date_ranges ?? [];
  const seedsLower = config.high_stakes_seeds.map((s) => s.toLowerCase());
  const lastSubMap = await loadLastSubstantiveEdits(
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
          } catch (_e) {
            // Broken frontmatter: skip; page enters with no audit fields.
          }
        }
        const audit = getAuditFields(parsed);
        const authorNotes = (parsed.author_notes ?? {}) as Record<string, unknown>;
        const needsTriage = "priority" in authorNotes && !audit.priority;
        const title = (((parsed.details as Record<string, unknown>) ?? {}).title as string) ?? rel;
        const lastSub = lastSubMap.get(rel) ?? null;
        const haystackLower = `${rel} ${title}`.toLowerCase();
        const matches = findSeedMatches(haystackLower, seedsLower, config.high_stakes_seeds);
        const matchesLower = matches.map((m) => m.toLowerCase());
        const pressure = changelogPressureForPage(matchesLower, haystackLower, changelogBlob);

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

  return pages;
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
    return;
  }
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

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["json"],
    string: ["phase", "section", "batch"],
  });
  const config = await loadConfig();
  const changelogBlob = await loadChangelogBlob(config);
  const pages = await collectPages(config, changelogBlob);

  if (args.json) {
    console.log(JSON.stringify({ phase: currentPhase(pages), pages }, null, 2));
    return;
  }
  printHuman(pages, args);
}

if (import.meta.main) {
  await main();
}
