# CloudCannon Platform Documentation

Getting things prepared:

- [Install Deno](https://deno.land/manual@v1.30.3/getting_started/installation). Either the curl shell or brew.
- Serve the website locally: `deno task serve`
- Build the static website: `deno task build`

Deno doesn't have a specific step for installing dependencies, instead the first run will download and cache what is needed.

## Directory Layout

- `_components`
    - Components are a primary concept in Lume, can be written in many different syntaxes, and referenced from other syntaxes.  
    In this repo, we have components written in `jsx` and these can be referenced from any content or layout file.  
    Generally, anything written in here will be used as a snippet inside our content files. Otherwise put it in `_includes`
- `_data`
    - A data directory, very similar to Jekyll or Eleventy. Files in this directory are available on the global scope (not a `data` scope). i.e. it is `site.navigation` not `site.data.navigation`.
- `_includes`
    - An includes directory. Various nunjucks templates live in here for building the site layouts.  
    The `scripts` directory here contains files that are bundled into the site javascript using esbuild.  
    The `styles` directory here contains files that are bundled into the site css using sass.
- `articles`, `changelogs`, `guides`
    - Our main collections, output at `/documentation/[collection]/[slug]/`.  
    Written as MDX to enable nicer snippets, otherwise standard markdown.
- `assets`
    - Files that are part of the site/layouts. SCSS and JS files here will be processed through the appropriate bundler. Other files will not be passed through.  
    Most SVGs in here will likely be inlined into the site. More on that below.
- `uploads`
    - Our directory for CMS-uploaded files.
- `ye_olde_images`
    - All images migrated from the old docs codebase, flattened to images that are actually referenced in the content.

## Lume Config

Lume is configured in the `_config.ts` file. This is where we import and define all of our plugins

## Using a component

Components are available under the `comp` namespace wherever you are. 

In a `njk` file:
```hbs
{% comp "Notice", info_type: "note" %}
    Two genera of geese are only tentatively placed in the Anserinae; they may belong to the shelducks or form a subfamily on their own
{% endcomp %}
```

In an `mdx` file:

```md
<comp.Notice info_type="info">

    Alternatively, drag and drop files into the File Browser.

</comp.Notice>
```

In a `jsx` file:

```jsx
export default function ({ comp }) {
    return (
        <comp.Notice info_type="info">

            Alternatively, drag and drop files into the File Browser.

        </comp.Notice>
    );
}
```

## Writing JSX Components

A good sample is `_components/DocsImage.jsx`:

```md
Usage:
<comp.DocsImage path="/img.png" alt="Alt text" type="screenshot" />
```

```jsx
export default function ({comp, type, path, alt}, helpers) {
    let imageClass = "c-docs-image";
    if (type === "screenshot") {
        imageClass += " c-docs-image--type-screenshot";
    }
    return (
        <div className="c-docs-image__wrapper">
            <div className={imageClass}>
                <img className="c-docs-image__image" src={helpers.url(path)} alt={alt} loading="lazy" />
            </div>
        </div>
    );
}
```

The first argument is an object that contains the `comp` namespace, as well as any props that were passed to the component. If it is a component that wraps markdown, that content will be available as `children` in this object.

The second argument contains any helpers on the site — e.g. the filters that would be available for a `njk` template. Where the layout might do `{{ title | md }}`, your JSX component can do `{ helpers.md(title) }`

## Tweaking the output HTML

Lume allows us to write rich postprocessing using a DOM as part of the SSG, for example to add hash links to all of our headings we can write:

```js
site.process([".html"], (page) => {
    page.document.querySelectorAll('h1').forEach((el) => {
        el.addAttribute("id", slugify(el.innerText));
    }
});
```

## Inlining images

The `inline` attribute can be added to an `img` tag, and the build process will convert that to an inline image rather than a URL. If the path leads to an SVG, the `img` tag will be turned into an `svg` one.  
This lets us keep our SVG icons in a sane location within assets, but inline them as needed without the indirection of an include. e.g.:

```html
<img src="/assets/img/arrow.svg" class="my-class-name" inline>
```

becomes:

```html
<svg class="my-class-name" width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.589844 1.41L5.16984 6L0.589844 10.59L1.99984 12L7.99984 6L1.99984 0L0.589844 1.41Z" fill="#393939"/>
</svg>
```

## Bundling packages

The esbuild flow on this website utilizes Deno rather than Node for module resolution, so Deno packages should be imported by URL. Node packages can be imported by their npm name & version, prefixed with `npm:`. See `_includes/scripts/alpine.js`:

```js
import Alpine from 'npm:alpinejs@latest'
import intersect from 'npm:@alpinejs/intersect@latest'
```

These don't need to be added to a `package.json` anywhere, Lume/Deno will fetch them on first run. (This repo should never have a `package.json` in it).
