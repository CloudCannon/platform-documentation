# Plan: Disable Transitions on Page Load

## Problem
CSS transitions (background-color, border-color, fill) trigger during initial page load when the dark mode class is applied, causing a visible flash/animation instead of an instant theme application.

## Solution
Use a "no-transitions" pattern that disables transitions during initial page load, then enables them after the page has rendered.

## Implementation Steps

### Step 1: Add `no-transitions` class to HTML element
In `_includes/layouts/base.tsx`, add a `no-transitions` class to the `<html>` element.

```tsx
<html class="no-transitions" lang="en">
```

### Step 2: Add CSS to disable transitions when class is present
In `_includes/styles/variables.scss` or a global stylesheet, add:

```scss
html.no-transitions,
html.no-transitions * {
  transition: none !important;
}
```

### Step 3: Remove the class after initial render
Add a small inline script at the end of `<body>` that removes the class after a requestAnimationFrame (ensures CSS has been applied):

```html
<script>
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('no-transitions');
  });
</script>
```

## Why This Works
1. Page loads with `no-transitions` class → all transitions disabled
2. Dark mode script runs, applies `body.dark` class → no visible transition
3. After paint, `requestAnimationFrame` callback runs → removes `no-transitions`
4. User interactions now trigger smooth transitions as expected

## Alternative Considered
- Using `prefers-reduced-motion` media query - doesn't solve the load flash issue
- Inline critical CSS for dark mode - more complex, requires detecting preference server-side
- CSS-only with `transition-delay` - unreliable timing

## Files to Modify
1. `_includes/layouts/base.tsx` - Add class to `<html>`, add script to end of `<body>`
2. `_includes/styles/variables.scss` - Add the transition-disabling CSS rule
