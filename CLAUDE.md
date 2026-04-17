# Platform Documentation — Claude Instructions

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

## Style guide

Follow `STYLE_GUIDE.mdx` for all documentation writing — voice/tone, formatting, component usage, and CloudCannon-specific terminology.

## Plans

Store plan files in `.vscode/plans/`.
