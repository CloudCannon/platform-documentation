# Platform Documentation — Claude Instructions

## Before writing documentation

Read `STYLE_GUIDE.mdx` in full before writing or editing any documentation. Do not rely on recalled rules — read it fresh. Missing style rules on a first pass and fixing them after the fact is slower than reading the guide upfront.

## Skills

Skills are reference guides for repo-specific workflows. Read the relevant skill before starting work in that area:

- **Move or delete pages** — routing.json workflow for page moves, renames, and deletions: `.claude/skills/move-or-delete-pages.md`
- **Edit tool safety** — avoiding `replace_all` pitfalls when editing paths and filenames: `.claude/skills/edit-tool-safety.md`

---

Import AGENTS.md and STYLE_GUIDE_AGENTS.md directly into Claude's context at the start of every session, with no manual step required.
@AGENTS.md
@STYLE_GUIDE_AGENTS.md

## JSX conventions (*.tsx files)

This project uses **Lume** (Deno-based SSG), NOT React. Do not use React-specific types or patterns.

### Inline styles with non-standard CSS properties

For newer/non-standard CSS properties like `anchor-name` or `position-anchor`, use kebab-case string keys:

```tsx
// ❌ BAD - React-style camelCase or React types
style={{ anchorName: value }}
style={{ anchorName: value } as React.CSSProperties}

// ✅ GOOD - kebab-case string keys
style={{ "anchor-name": value }}
style={{ "position-anchor": value }}
```

### Alpine.js attributes

Use the project's attribute mappings from `_config.ts` for Alpine.js attributes that JSX doesn't support directly:

```tsx
// ❌ BAD - JSX doesn't allow @ or . or : in attribute names
@keydown.down="..."
x-trap.inert="..."
x-on:toggle="..."

// ✅ GOOD - use mapped attribute names
alpine-keydown-down="..."
x-trap-inert="..."
x-on-toggle="..."
```

See `alpineRemaps` in `_config.ts` for the full list of available mappings.
