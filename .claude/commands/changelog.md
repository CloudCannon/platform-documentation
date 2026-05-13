---
description: Generate a changelog from recent app commits and update related docs
---

# Changelog

Generate a new changelog entry in `platform-documentation/changelogs/<YYYY>/` from recent app commits, and update any docs affected by new or changed functionality.

This skill assumes both repos are open in the workspace at:
- `~/Documents/GitHub/app`
- `~/Documents/GitHub/platform-documentation`

Read `platform-documentation/STYLE_GUIDE.mdx` (sections 1.1.4 and 2.1) before drafting prose if you have not this session.

---

## Step 1: Find the cutoff date

The cutoff is the `date` field in the most recent changelog. Use the *frontmatter date*, not the filename — they sometimes differ by a day (timezone).

```bash
# Latest changelog file in the current year (sorted lexically — filenames are MM-DD_*).
LATEST=$(ls platform-documentation/changelogs/$(date +%Y)/ | sort | tail -1)

# Pull the date field out of the frontmatter.
SINCE=$(grep '^date:' "platform-documentation/changelogs/$(date +%Y)/$LATEST" | sed 's/date: //')

echo "Latest changelog: $LATEST"
echo "Cutoff (since): $SINCE"
```

Tell the user the cutoff date and the title of the previous changelog so they can sanity-check it.

> **Caveat to mention:** the changelog `date` is the *publish* date, not the production-release commit. In practice this catches everything since the last shipped changelog, which is what you want — but if a release was delayed or skipped, eyeball the commit list before drafting.

## Step 2: Gather app commits

Run from the `app` repo. Exclude merge commits (noise) and surface dependabot bumps separately so you can collapse them.

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
| Cutoff source | `date:` frontmatter field of latest file in `changelogs/<YYYY>/` |
| Commit source | `git log --since="$SINCE" --no-merges` in `app/` |
| File path | `platform-documentation/changelogs/<YYYY>/<MM-DD>_<kebab-title>.mdx` |
| Branch | `changelog/<YYYY-MM-DD>` (today, NZ-local) |
| Doc search scope | all of `developer/` and `user/` (articles, guides, reference, glossary), plus `beta/` if relevant |
| Style rules | `STYLE_GUIDE.mdx` §1.1.4 (past tense), §2.1 (changelog format) |
| Repo rules | `platform-documentation/AGENTS.md` (scope, stop condition, ask-first list) |
