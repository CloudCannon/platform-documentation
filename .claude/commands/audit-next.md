---
description: Show the next batch of pages to audit for out-of-date content
---

# Audit next

Show the next batch of pages to audit, ranked by the priority framework in [`.claude/plans/content-audit-mega.plan.md`](../plans/content-audit-mega.plan.md). The queue is derived on demand from git history, changelogs, page frontmatter, and [`_scripts/audit-config.yml`](../../_scripts/audit-config.yml) — it never goes stale.

## Default — show the next batch

```bash
deno task audit-queue
```

The script refuses to run if any of these are true:

- `app/` (path configurable via `app_repo_path` in [`_scripts/audit-config.yml`](../../_scripts/audit-config.yml), default `../app`) isn't checked out on `main` and up to date with `origin/main` — auditors verify factual claims against released app code, not feature-branch or stale state. Origin is fetched on each run (soft-fails offline) and the script exits with a commits-behind count if local main is behind.
- Any audited page is missing `app_sha`.
- Any in-scope `.mdx` has unparseable YAML frontmatter — the offending paths and parser messages are printed so they can be fixed before the next run. (Silently skipping broken pages would hide audit state behind a "looks unaudited" mask.)

The output is:
- Current phase (1 — script + P0/P1 confirmation, 2 — P0 audit, 3 — P1 audit, 4 — P2 sweep).
- Audit progress (audited / total) and queue counts per priority.
- Suggested batch (~40 pages by default), each with rationale and last substantive edit date.

In Phase 1 the batch is suggested for ~2-minute skim per page (priority confirmation only). In Phases 2–4 it's the next full four-lens audit batch.

## Useful flags

```bash
# Larger or smaller batch.
deno task audit-queue -- --batch=20

# Force a specific phase even if earlier phases aren't done.
deno task audit-queue -- --phase=3

# Scope to a specific nav section (path prefix match).
deno task audit-queue -- --section=developer/articles

# Explain why a single page got its priority. Dumps every input signal
# (last substantive edit, high-stakes matches, changelog pressure, plan
# ownership), the current audit verdicts, any drift since review, and any
# standing-check flags. Useful when the queue surprises you.
deno task audit-queue -- --explain=user/articles/<slug>.mdx

# Combine — and use JSON for ad-hoc filtering.
deno task audit-queue -- --section=developer/guides --json | jq '.pages | map(select(.priority=="P0"))'
```

## What "next" depends on

- Pages with `author_notes.last_reviewed` are audited and skipped from the priority queue, but re-surface in the **Standing checks** block when something has moved on (see below).
- Pages tagged as plan-owned in [`_scripts/audit-config.yml`](../../_scripts/audit-config.yml) (`pre_scheduled_pages`, `externally_coupled_pages`) are skipped.
- Pages with `author_notes.priority` set are treated as priority-confirmed; the frontmatter value wins over the rubric.
- Pages with the `priority:` key present but empty (typically new docs scaffolded from the schema) are surfaced separately as "Needs triage" and sort first within their priority tier — these are new arrivals that haven't had their Phase 1 skim yet.

## Standing checks — when re-audit is due

After every full pass, the script keeps watching audited pages. A page re-surfaces in the **Standing checks** block at the bottom of the output when:

- **Drift since review.** One or more substantive commits (≥30 lines, non-mechanical) have touched the file since `author_notes.last_reviewed`. The verdicts on file may no longer reflect what's there now.
- **Re-review due.** Either the page's notes contain a `Next review: YYYY-MM-DD` hint and that date has passed, or it doesn't and `last_reviewed` is more than 12 months ago.

To override the 12-month default for a specific page, drop a line like `Next review: 2027-03-01` anywhere in `author_notes.notes` — the script picks it up case-insensitively.

## What each audit lens tracks

When auditing (Phase 2 onwards), each lens has a specific scope. Don't conflate them:

- **`factual`** — Does the page accurately describe current product behaviour, plan gates, and flow steps? Verified against `app/` code.
- **`persona`** — Five-question framework. Does it serve the right primary persona, with permission-led language, and without hanging references?
- **`style`** — STYLE_GUIDE.mdx compliance: terminology, capitalisation, italics for UI, component usage.
- **`ui`** — **Stale UI prose only.** A page says "click the *Site Settings* button" but the button has moved/renamed/disappeared in the current app. Not for docshot completeness — that's the existing `docshots` field (`Added!` / `Needs docshots` / `Not applicable`).

## How "last substantive edit" is computed

The script reports `last sub-edit YYYY-MM-DD` (or `no substantive edits`) per page, based on git history:

1. **Bulk pass.** One `git log --numstat` over all in-scope directories finds commits touching each file by ≥30 lines (`substantive_edit_threshold_lines` in the config), excluding commits whose subject matches `non_substantive_commit_patterns` or whose date falls in a `skip_commit_date_ranges` window. Fast (~0.7s) but doesn't follow renames.
2. **Recovery pass.** For every page the bulk pass returned null on, the script runs `git log --follow --numstat` per file in parallel. `--follow` walks the rename chain, so files renamed during the 2025 redesign recover their real pre-rename history. ~5s wall on a cold cache.

**"No substantive edits" / `no record` in output means**: even after the recovery pass, no commit at any historical name for this file crossed the ≥30-line threshold (and wasn't skipped by pattern or date window). Three possible underlying causes:

- The page is genuinely new since the redesign and hasn't had a substantive write since.
- The page is small and stable — exists, had small edits over the years, but never crossed the 30-line bar.
- The page truly hasn't been substantively touched in a long time — a coverage-gap signal worth treating seriously.

The script can't distinguish these three without a human read. In all three cases the rubric treats null as a P0/P1 trigger when paired with a high-stakes seed, on the principle that "I can't tell" is closer to "needs attention" than to "fine."

## When the output looks wrong

Most likely cause: the config in [`_scripts/audit-config.yml`](../../_scripts/audit-config.yml) is missing a high-stakes seed or has the wrong staleness thresholds. Edit and re-run. If a specific page is mis-prioritised, add `author_notes.priority: P<N>` to its frontmatter as a one-page override.
