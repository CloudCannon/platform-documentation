# 📚 CloudCannon Platform Documentation

Welcome! This is the source repository for the **CloudCannon platform documentation** — the official docs site at [cloudcannon.com/documentation](https://cloudcannon.com/documentation/). It covers everything users and developers need to know about CloudCannon, from getting started to advanced configuration.

Built with [Lume](https://lume.land/) (a Deno-based static site generator), MDX content, and JSX/TSX components.

---

## 🗺️ Finding your way around

The documentation is organized into clear sections so you can find what you need quickly:

* **User Articles** (`user/articles/`) — Explanations of CloudCannon concepts and features for all users.
* **User Guides** (`user/guides/`) — Step-by-step instructions for common tasks.
* **User Glossary** (`user/glossary/`) — Definitions of key terms used across the platform.
* **Developer Articles** (`developer/articles/`) — In-depth explanations for developers integrating with CloudCannon.
* **Developer Guides** (`developer/guides/`) — Hands-on walkthroughs for developer workflows.
* **Developer Reference** (`developer/reference/`) — Technical reference material for configuration and APIs.
* **Changelog** (`changelogs/`) — Release notes organized by year.

Content follows a modified [Diátaxis framework](https://diataxis.fr/) — separating explanations, instructions, guides, and reference material so readers always land in the right place.

---

## 🚀 Getting started

1. [Install Deno](https://docs.deno.com/runtime/getting_started/installation/) via curl, brew, or your preferred method.
   This repo pins Deno **2.6.8** in `.dvmrc` — if you use [dvm](https://github.com/justjavac/dvm) it will pick this up automatically.
2. Run `deno task serve` to build the site and start a local dev server.

Deno doesn't have a separate dependency-install step; the first run will download and cache everything automatically.

**Available tasks:**

| Task | Command | Description |
|------|---------|-------------|
| `serve` | `deno task serve` | Build with Pagefind + start dev server |
| `build` | `deno task build` | Build the static site with Pagefind |
| `check-links` | `deno task check-links` | Check for broken internal links |
| `serve:local-docshots` | `deno task serve:local-docshots` | Symlink local docshots + serve with `DOCSHOTS_LOCAL=1` * |

\* The `serve:local-docshots` task creates a symlink to `../app/app/assets/e2e/screenshots`. This only works if you have the [app](https://github.com/CloudCannon/app) repo cloned as a sibling directory.

## 🔍 Development with Search

The site uses [Pagefind](https://pagefind.app/) for search functionality. Pagefind
is integrated into Lume via `_config.ts` and runs automatically after each build.

Just run `deno task serve` and search will work automatically.

## 📁 Directory layout

### Content

- `developer/` — Developer-facing documentation (`articles/`, `guides/`, `reference/`).
- `user/` — User-facing documentation (`articles/`, `guides/`, `glossary/`).
- `changelogs/` — Release notes organized by year.
- `beta/` — Documentation for features currently in beta.
- `uploads/` — Directory for CMS-uploaded files.
- `ye_olde_images/` — Legacy images migrated from the old docs codebase.

### Site infrastructure

- `_components/` — Lume JSX/TSX components, available under the `comp` namespace in content and layout files.
- `_includes/` — Layouts, plus `scripts/` (bundled with esbuild) and `styles/` (bundled with Sass).
- `_data/` — Global data files (YAML/JSON). Available on the global scope — e.g. `site.navigation`, not `site.data.navigation`.
- `_config.ts` — Main Lume configuration; imports and configures all plugins.
- `_config/` — Additional Lume configuration modules (e.g. Prism, `llms-text`).
- `_plugins/` — Custom Lume plugins (e.g. Pagefind wrapper).
- `_scripts/` — Utility scripts (e.g. `check-links.ts`).
- `_reference/` — Reference source material.
- `assets/` — Static assets. SCSS and JS files are processed by their respective bundlers; other files pass through as-is.
- `cloudcannon.config.yml` — CloudCannon CMS configuration (collections, inputs, editor settings).

## ⚙️ Lume Config

Lume is configured in `_config.ts`. This is where all plugins are imported and defined.

## 🧩 Using a component

Components are available under the `comp` namespace wherever you are.

In an `mdx` file:

```md
<comp.Notice info_type="info">

    Alternatively, drag and drop files into the File Browser.

</comp.Notice>
```

In a `tsx` file:

```tsx
export default function ({ comp }) {
  return (
    <comp.Notice info_type="info">
      Alternatively, drag and drop files into the File Browser.
    </comp.Notice>
  );
}
```

## ✏️ Writing JSX/TSX components

A good sample is `_components/DocsImage.tsx`:

```md
Usage: <comp.DocsImage path="/img.png" alt="Alt text" type="screenshot" />
```

```tsx
import ImageWrapper from "./ImageWrapper.tsx";
import type { Helpers } from "../_types.d.ts";

interface DocsImageProps {
  type?: string;
  path: string;
  alt?: string;
  title?: string;
}

export default function DocsImage(
  { type, path, alt, title }: DocsImageProps,
  helpers: Helpers,
) {
  return (
    <ImageWrapper src={helpers.url(path)} alt={alt} title={title} type={type} />
  );
}
```

The first argument is an object containing any props passed to the component. If
the component wraps markdown, that content will be available as `children`.

The second argument contains site helpers — e.g. the filters available in
templates. Where a layout might do `{{ title | md }}`, your component can do
`{ helpers.md(title) }`.

## 🔧 Tweaking the output HTML

Lume allows us to write rich postprocessing using a DOM as part of the SSG, for
example to add hash links to all of our headings we can write:

```js
site.process([".html"], (page) => {
    page.document.querySelectorAll('h1').forEach((el) => {
        el.addAttribute("id", slugify(el.innerText));
    }
});
```

## 🖼️ Inlining images

The `inline` attribute can be added to an `img` tag, and the build process will
convert that to an inline image rather than a URL. If the path leads to an SVG,
the `img` tag will be turned into an `svg` one.
This lets us keep our SVG icons in a sane location within assets, but inline
them as needed without the indirection of an include. e.g.:

```html
<img src="/assets/img/arrow.svg" class="my-class-name" inline>
```

becomes:

```html
<svg
  class="my-class-name"
  width="8"
  height="12"
  viewBox="0 0 8 12"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M0.589844 1.41L5.16984 6L0.589844 10.59L1.99984 12L7.99984 6L1.99984 0L0.589844 1.41Z"
    fill="#393939"
  />
</svg>
```

## 📦 Bundling packages

The esbuild flow on this website utilizes Deno rather than Node for module
resolution, so Deno packages should be imported by URL. Node packages can be
imported by their npm name & version, prefixed with `npm:`. See
`_includes/scripts/alpine.js`:

```js
import Alpine from "npm:alpinejs@latest";
import intersect from "npm:@alpinejs/intersect@latest";
```

These don't need to be added to a `package.json` anywhere, Lume/Deno will fetch
them on first run. (This repo should never have a `package.json` in it).

---

## ✅ CI and quality checks

A [GitHub Actions workflow](.github/workflows/linting.yml) runs on every push and PR to `main`:

1. **Lint** — `deno lint` and `deno check --all` (TypeScript type-checking).
2. **Check Links** — builds the full site, then runs `deno task check-links` to catch broken internal links.

Run these locally before opening a PR to catch issues early:

```sh
deno lint
deno check --all
deno task build && deno task check-links
```

---

## 🤝 Contributions and Style Guide

We welcome open-source contributions! To submit a fix or improvement:

1. Fork the repository at [github.com/CloudCannon/platform-documentation](https://github.com/CloudCannon/platform-documentation).
2. Create a branch for your change.
3. Follow the Style Guide (`STYLE_GUIDE.mdx`) for content conventions.
4. Open a Pull Request — we'll review it and get back to you.

Before contributing content, please read the **Style Guide** located at `STYLE_GUIDE.mdx` in the repository root. It covers:

* Writing standards and voice/tone
* The Diátaxis content framework
* Formatting conventions
* Component usage
* Link and accessibility guidelines

---

## 🔗 Important Resources

| Resource | Link |
|----------|------|
| 🌐 Live documentation | [cloudcannon.com/documentation](https://cloudcannon.com/documentation/) |
| 💬 Community forum | [community.cloudcannon.com](https://community.cloudcannon.com/) |
| 📝 Documentation feedback | [Documentation Feedback forum](https://community.cloudcannon.com/c/documentation-feedback/) |
| 🆘 Support | [cloudcannon.com/support](https://cloudcannon.com/support/) |
| 🐙 GitHub repository | [CloudCannon/platform-documentation](https://github.com/CloudCannon/platform-documentation) |

---

## 📬 Contact

Have questions, suggestions, or just want to say hi?

* ✉️ **Email:** [ella@cloudcannon.com](mailto:ella@cloudcannon.com) (CloudCannon's Technical Writer)
* 🆘 **Support:** [cloudcannon.com/support](https://cloudcannon.com/support/)
* 🐙 **GitHub Issues & PRs:** [github.com/CloudCannon/platform-documentation](https://github.com/CloudCannon/platform-documentation)

We'd love to hear from you! 💙☁️
