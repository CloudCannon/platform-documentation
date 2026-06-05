---
description: Show the next batch of pages to audit for out-of-date content
---

# Audit next

Show the next batch of pages to audit, ranked by the priority framework in [`.claude/plans/content-audit-mega.plan.md`](../plans/content-audit-mega.plan.md). The queue is derived on demand from git history, changelogs, page frontmatter, and [`_scripts/audit-config.yml`](../../_scripts/audit-config.yml) — it never goes stale.

## Default — show the next batch

```bash
deno task audit-queue
```

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

# Combine — and use JSON for ad-hoc filtering.
deno task audit-queue -- --section=developer/guides --json | jq '.pages | map(select(.priority=="P0"))'
```

## What "next" depends on

- Pages with `author_notes.last_reviewed` are audited and skipped.
- Pages tagged as plan-owned in [`_scripts/audit-config.yml`](../../_scripts/audit-config.yml) (`pre_scheduled_pages`, `externally_coupled_pages`) are skipped.
- Pages with `author_notes.priority` set are treated as priority-confirmed; the frontmatter value wins over the rubric.
- Pages with the `priority:` key present but empty (typically new docs scaffolded from the schema) are surfaced separately as "Needs triage" and sort first within their priority tier — these are new arrivals that haven't had their Phase 1 skim yet.

## When the output looks wrong

Most likely cause: the config in [`_scripts/audit-config.yml`](../../_scripts/audit-config.yml) is missing a high-stakes seed or has the wrong staleness thresholds. Edit and re-run. If a specific page is mis-prioritised, add `author_notes.priority: P<N>` to its frontmatter as a one-page override.
