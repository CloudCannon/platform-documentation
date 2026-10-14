---
description: Generate a changelog from recent app commits and update related docs
---

# Changelog

Generate a new changelog entry in `platform-documentation/changelogs/<YYYY>/` from recent commits, and update any docs affected by new or changed functionality.

The `app` repo is the **primary** source of changelog-worthy changes, but a release can also ship user-facing changes from the other product repos open in the workspace (for example `syncer`, `hooks-worker`, `site-scanner`). Always scan `app` first; then check the sibling repos and fold any genuinely user-facing changes into the same changelog. Skip internal/staff-only repos and tooling, `platform-documentation` itself, and pure-dependency repos that `app` already pulls in as a package (e.g. the `javascript-api` types) — their changes arrive through `app`'s dependency bumps.

This skill assumes the repos are open in the workspace. Paths vary by machine — this workspace uses `~/Work/cloudcannon/<repo>`; older setups use `~/Documents/GitHub/<repo>`. The examples below use `app` / `platform-documentation` as shorthand — substitute the actual paths.

Read `platform-documentation/STYLE_GUIDE.mdx` (sections 1.1.4 and 2.1) before drafting prose if you have not this session.

---

## Step 1: Find the cutoff

The changelog covers everything the `app` repo has shipped since the last one. The cutoff can be **a commit hash** or **a date** — a hash is more precise, so prefer it whenever the user gives you one.

**Mode A — the user supplied a commit hash** (e.g. "changelog since `3a7c87781a`", or a hash passed as the command argument). Use that commit as the cutoff and skip the date lookup. Everything *after* the commit counts. Confirm it exists locally first, and echo its subject back so the user can sanity-check:

```bash
cd ~/Documents/GitHub/app
CUTOFF=3a7c87781a            # the hash the user gave
git log --oneline -1 "$CUTOFF"   # errors if not present locally — fetch/ask if so
```

**Mode B — no hash given.** Fall back to the `date` field in the most recent changelog. Use the *frontmatter date*, not the filename — they sometimes differ by a day (timezone).

```bash
# Latest changelog file in the current year (sorted lexically — filenames are MM-DD_*).
LATEST=$(ls platform-documentation/changelogs/$(date +%Y)/ | sort | tail -1)

# Pull the date field out of the frontmatter.
SINCE=$(grep '^date:' "platform-documentation/changelogs/$(date +%Y)/$LATEST" | sed 's/date: //')

echo "Latest changelog: $LATEST"
echo "Cutoff (since): $SINCE"
```

Tell the user the cutoff (hash + subject, or date) and the title of the previous changelog so they can sanity-check it.

> **Caveat to mention (Mode B only):** the changelog `date` is the *publish* date, not the production-release commit. In practice this catches everything since the last shipped changelog, which is what you want — but if a release was delayed or skipped, eyeball the commit list before drafting. A hash cutoff (Mode A) avoids this ambiguity entirely.

## Step 2: Gather app commits

Run from the `app` repo. Exclude merge commits (noise) and surface dependabot bumps separately so you can collapse them.

**Mode A (hash cutoff)** — use the `<hash>..HEAD` range:

```bash
cd ~/Documents/GitHub/app

# Direct commits, excluding merges
git log "$CUTOFF"..HEAD --no-merges --pretty=format:"%h %ad %s" --date=short

# Merged PRs (titles often more descriptive than the squash commit)
git log "$CUTOFF"..HEAD --merges --pretty=format:"%h %s"
```

**Mode B (date cutoff)** — use `--since`:

```bash
cd ~/Documents/GitHub/app

# Direct commits, excluding merges
git log --since="$SINCE" --no-merges --pretty=format:"%h %ad %s" --date=short

# Merged PRs (titles often more descriptive than the squash commit)
git log --since="$SINCE" --merges --pretty=format:"%h %s"
```

For any commit/PR that isn't obvious from its title, look at the diff:

```bash
git show <hash> --stat
git log <hash> -1 -p -- path/to/interesting/file
```

Pay particular attention to:
- New files in `app/assets/javascripts/views/**/*.view.ts` (Lit conversions — usually a "Features & Improvements" line about converting an area to Lit)
- Changes under `app/app/views/`, `app/app/controllers/`, and `app/assets/javascripts/views/` (user-visible behaviour)
- New routes, new settings keys, new UI strings

### Also scan the sibling product repos

After `app`, run the same commit sweep in the other product repos open in the workspace (`syncer`, `hooks-worker`, `site-scanner`, and any others present). Don't scan repos that `app` consumes as a package (e.g. the `javascript-api` types) — their changes already arrive through `app`'s dependency bumps. A hash cutoff only makes sense in the repo it came from — for the siblings, use the **date** cutoff (Mode B `$SINCE`) so the window lines up with the last changelog. Most releases are `app`-only, so expect these to be empty or near-empty; when they do have changes, keep only the genuinely user-facing ones and merge them into the same buckets. Note the source repo to yourself while triaging, but the changelog prose is product-facing — describe the change by what the user experiences, not by which repo it landed in.

```bash
for repo in syncer hooks-worker site-scanner; do
  echo "=== $repo ==="
  git -C ~/Work/cloudcannon/$repo log --since="$SINCE" --no-merges --pretty=format:"%h %ad %s" --date=short
  echo
done
```

## Step 3: Sort commits into changelog buckets

Categorise each non-trivial commit into one of:

- **Features & Improvements** — new functionality, UI additions, performance work, behaviour changes
- **Fixes** — bug fixes (any commit starting with "Fix")
- **Drop** — internal refactors with no user-visible effect, test-only changes, repo tooling

Roll up the following into the standard line `Updated dependencies to patch security vulnerabilities.` in the **Fixes** section:
- Dependabot bumps (any `Bump <pkg> from X to Y`)
- `npm_and_yarn` and `bundler` PR merges
- Patch-only library updates without user-visible change

Surface anything ambiguous to the user before drafting — don't guess at user-facing impact for a commit you can't decode from the diff.

### Differentiate production fixes from within-batch fixes

A changelog announces fixes to bugs users actually **hit on production**. A "Fix …" commit in this range is often not that — it repairs a bug that was *introduced by other work in the same unreleased batch* (e.g. a regression in a new feature branch, caught before release). Users never saw it, so listing it as "Fixed an issue where…" is misleading noise. **Drop within-batch fixes from the Fixes section** — they were part of building the feature, not a shipped fix.

For every candidate fix, decide whether the buggy code **existed at the cutoff** (production) or was **introduced after it** (this batch). The cutoff is the reference point either way — a hash cutoff (Mode A) makes this check exact.

```bash
cd ~/Documents/GitHub/app

# Did the file the fix touches exist at the cutoff at all?
git cat-file -e "$CUTOFF":path/to/file.ts && echo "existed@cutoff" || echo "NEW in batch"

# Did the specific buggy code/symbol exist at the cutoff?
git show "$CUTOFF":path/to/file.ts | grep -n "someBuggyFunctionOrString"
```

- **File or feature is new since the cutoff** → the fix repairs this-batch work → **within-batch, drop it.** (A telltale: the fix only touches views/routes/components that another commit in the same range created.)
- **The buggy code existed at the cutoff** → real production bug → **keep it** in Fixes.
- **Borderline** (e.g. a fix coupled to a new feature but the underlying capability shipped earlier) → keep it, but reword so it describes only the production-relevant scenario, and flag the call to the user.

Features & Improvements don't need this split — new capabilities are net-new by definition. It applies to the Fixes list. When you drop within-batch fixes, tell the user which ones and why (a short table of fix → existed-at-cutoff? → verdict works well), so they can override.

## Step 4: Draft the changelog

**File location:** `platform-documentation/changelogs/<YYYY>/<MM-DD>_<kebab-title>.mdx`
- Use today's date (NZ-local — `date +%m-%d`).
- Title: short, sentence-case, descriptive of the headline change. Use `general-fixes` only if there are no notable features.

**Frontmatter:**

```yaml
---
_schema: default
title: <Sentence case title>
date: <YYYY-MM-DD>T<HH:MM:SS>+12:00
---
```

Use the current local time for the `date` field. Timezone is always `+12:00` (NZ).

**Body structure** (follow [STYLE_GUIDE.mdx §2.1](../../STYLE_GUIDE.mdx)):

1. **Intro paragraph** (1–2 sentences) — summarise the headline features.
2. *Optional* second intro paragraph — list the main fix areas, e.g. *"It also addressed several issues, including those affecting X, Y, and Z."*
3. `## Features & Improvements` — bullet list. Past tense, lead with the verb (Added, Changed, Improved, Removed). Italicise UI elements with `*Asterisks*`. Be specific — no "Improved tooltips."
4. `## Fixes` — bullet list. Each entry starts with `Fixed an issue where…`. Always end with `Updated dependencies to patch security vulnerabilities.` if any dep bumps were rolled up.

Omit a section entirely if it has no entries. Skip the second intro paragraph if there are no fixes.

**Voice rules from the style guide:**
- Past tense only ("Added", not "You can now add")
- Sentence case in body; UI elements italicised
- Oxford comma
- Don't invent UI labels — if you can't confirm a name from the diff, ask

## Step 5: Create the branch and write the file

```bash
cd ~/Documents/GitHub/platform-documentation
git checkout -b changelog/$(date +%Y-%m-%d)
```

Then write the file with the Write tool. Do **not** stage, commit, or push — leave that for the user to review.

## Step 6: Review related docs for new features

For each entry in **Features & Improvements** (skip pure Fixes), check whether existing docs need updates. Search across **all** content trees, not just articles — reference and glossary pages often need to change too:

```bash
# Search every content surface for mentions of the affected feature.
# Covers: developer/{articles,guides,reference} and user/{articles,guides,glossary}
grep -rli "<feature keyword>" \
  platform-documentation/developer/ \
  platform-documentation/user/
```

Run a search for each meaningful feature keyword (UI label, config key, feature name). For renamed UI, search the *old* name as well as the new one.

Also check `platform-documentation/beta/` if the feature is beta-flagged.

For each file that mentions the affected feature:
1. Read it in full.
2. Identify what would need to change (new option, renamed UI element, additional step, new screenshot, new reference entry, glossary update).
3. **Ask the user before editing** — surface the file, the proposed change, and the reasoning. Only edit after confirmation. (Per `AGENTS.md`: "ask before changing anything ambiguous.")

Do **not** create new articles, guides, reference entries, or glossary terms unless the user explicitly asks. Per `AGENTS.md`: "Do not create new files… unless explicitly requested."

## Step 7: Stop and report

Per the docs repo `AGENTS.md` stop condition:

1. Summarise what changed (1–3 lines): the new changelog filename, the branch name, and how many doc pages were updated (or proposed for update).
2. List anything you noticed but did not touch — commits you couldn't categorise, pages that might need updates but weren't obvious, etc.
3. Stop. Don't run lint/build/check-links unless asked.

---

## Quick reference

| | |
|--|--|
| Cutoff source | A commit hash if the user gives one (Mode A); otherwise the `date:` frontmatter of the latest file in `changelogs/<YYYY>/` (Mode B) |
| Repos scanned | `app` (primary), then sibling product repos (`syncer`, `hooks-worker`, `site-scanner`); skip internal/staff-only repos, `platform-documentation`, and dependency repos `app` already bundles (e.g. `javascript-api` types) |
| Commit source | `git log "$CUTOFF"..HEAD --no-merges` (Mode A) or `git log --since="$SINCE" --no-merges` (Mode B) in `app/`; date cutoff for siblings |
| Fix scope | Only production bugs (buggy code existed at the cutoff). Drop within-batch fixes — regressions introduced *and* fixed in this same unreleased range |
| File path | `platform-documentation/changelogs/<YYYY>/<MM-DD>_<kebab-title>.mdx` |
| Branch | `changelog/<YYYY-MM-DD>` (today, NZ-local) |
| Doc search scope | all of `developer/` and `user/` (articles, guides, reference, glossary), plus `beta/` if relevant |
| Style rules | `STYLE_GUIDE.mdx` §1.1.4 (past tense), §2.1 (changelog format) |
| Repo rules | `platform-documentation/AGENTS.md` (scope, stop condition, ask-first list) |
