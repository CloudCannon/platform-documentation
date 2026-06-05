# Platform Documentation — Claude instructions

This repo is the source for [cloudcannon.com/documentation](https://cloudcannon.com/documentation/). Built with Lume + MDX + JSX/TSX. Content follows a modified [Diátaxis](https://diataxis.fr/) framework.

Before doing any content work, read `STYLE_GUIDE.mdx`. It is the source of truth for voice, tone, formatting, components, links, and accessibility.

---

## Scope discipline

Do exactly what was asked. Nothing more.

- Do not run tests, lint, typecheck, or build unless I ask, or unless the task is explicitly "make tests pass" / "fix the lint" / "fix the build."
- Do not edit files outside the ones implicated by the request, even if you see issues. Mention them at the end instead.
- Do not refactor or rename adjacent code/content.
- Do not create new files (including new articles, guides, components, READMEs, examples) unless explicitly requested. Prefer editing existing files.
- Do not add narrating comments to code. Comments only for non-obvious intent or workarounds.
- Do not run `git add` / `commit` / `push` / `branch` / open PRs unless explicitly asked.
- Do not start follow-up work after finishing. Stop and report.
- Do not delegate the whole task to subagents.

**Default to the smallest possible change. When in doubt, ask before expanding scope.**

## Stop condition

After the requested change is made:

1. Briefly summarise what changed (1–3 lines).
2. List anything you noticed but did NOT touch.
3. Stop. Wait for the next instruction.

---

## Tone & writing

Follow `STYLE_GUIDE.mdx`. The high-level rules:

- Match the existing voice of the surrounding section. Don't rewrite an article's voice unless asked.
- Diátaxis: pick the right section for new content (`articles/` for explanation, `guides/` for instructions, `reference/` for reference, `glossary/` for definitions).
- Plain, direct, second person ("you"). Active voice. Short sentences.
- No emojis in content unless the surrounding page already uses them.
- Title case for headings only where the rest of the section uses it; otherwise sentence case. Match the file you're editing.
- Oxford comma.
- Don't invent product features, UI labels, or CLI flags. If you're not sure something exists, ask or check the repo.

## Links

- Internal links: relative paths to other docs, no `.mdx` extension.
- External links: full URL. Never link to staging or preview URLs.
- Don't add affiliate or tracking parameters.
- Anchor links must match the slugified heading.

## Components

- Use `<comp.X>` components from `_components/` rather than raw HTML where a component exists (notices, images, code groups, etc.).
- For images use `<comp.DocsImage path="…" alt="…" type="…" />`. Always include `alt`.
- For callouts use `<comp.Notice info_type="info|warning|tip">`. Match the existing tone of nearby notices.
- Don't introduce new components without being asked.

## Code samples

- Keep examples minimal and runnable. Don't add narrating comments.
- Use the smallest realistic example, not a full file dump.
- Prefer editing an existing example over adding a new one.
- For YAML/JSON config snippets, use the keys/structure that match `cloudcannon.config.yml` conventions in the repo.

---

## Repo conventions

- Lume config lives in `_config.ts` and `_config/`. Don't touch unless asked.
- Components live in `_components/` (TSX/JSX). See `lume-jsx-conventions` rule for component structure.
- Global data lives in `_data/` and is available on the global scope (e.g. `site.navigation`, not `site.data.navigation`).
- Content lives in `developer/` and `user/`, with `articles/` `guides/` `reference/` `glossary/` subfolders.
- Changelog entries live in `changelogs/<year>/`.
- Beta features live in `beta/`.
- Never add a `package.json`. Deno + import maps only.

## Tasks (only when asked)

| Task | Command |
|------|---------|
| Serve | `deno task serve` |
| Build | `deno task build` |
| Check links | `deno task check-links` |
| Check images | `deno task check-images` |
| Lint | `deno lint` |
| Typecheck | `deno check --all` |

Don't run any of these proactively.

---

## Process for content edits

1. Read `STYLE_GUIDE.mdx` if you haven't this session.
2. Read the file you're editing in full before changing it.
3. Match the surrounding voice, structure, and component usage.
4. Make the smallest change that satisfies the request.
5. Report what changed. Stop.

## Process for new content (only when explicitly requested)

1. Confirm the Diátaxis section (article / guide / reference / glossary).
2. Find a sibling page in the same section and mirror its frontmatter, structure, and tone.
3. Don't add navigation entries or cross-links unless asked.
4. Don't add images, screenshots, or DocShots unless asked.

---

## Things that are explicit "ask first"

- Renaming or moving any file.
- Adding a new component or new layout.
- Editing `_config.ts`, `_config/`, `_plugins/`, `_scripts/`, or `cloudcannon.config.yml`.
- Editing `STYLE_GUIDE.mdx` itself.
- Bulk edits across more than one article.
- Adding new top-level sections or navigation entries.
