import lume from "lume/mod.ts";
import pagefind from "lume/plugins/pagefind.ts";
import date from "lume/plugins/date.ts";
import sass from "lume/plugins/sass.ts";
import inline from "lume/plugins/inline.ts";
import esbuild from "lume/plugins/esbuild.ts";
import prism from "lume/plugins/prism.ts";
import sitemap from "lume/plugins/sitemap.ts";

import jsx from "lume/plugins/jsx.ts";
import mdx from "lume/plugins/mdx.ts";

import slugify from "npm:@sindresorhus/slugify@2.2.0";

// Data highlights
import "npm:prismjs@1.29.0/components/prism-yaml.js";
import "npm:prismjs@1.29.0/components/prism-json.js";
import "npm:prismjs@1.29.0/components/prism-toml.js";
import "npm:prismjs@1.29.0/components/prism-diff.js";
import "npm:prismjs@1.29.0/components/prism-ignore.js";

// Lang highlights
import "npm:prismjs@1.29.0/components/prism-bash.js";
import "npm:prismjs@1.29.0/components/prism-ruby.js";
import "npm:prismjs@1.29.0/components/prism-scss.js";
import "npm:prismjs@1.29.0/components/prism-typescript.js";

// Required language dependencies for languages like liquid
import "npm:prismjs@1.29.0/components/prism-markup-templating.js";

// Template highlights
import "npm:prismjs@1.29.0/components/prism-markdown.js";
import "npm:prismjs@1.29.0/components/prism-liquid.js";
import "npm:prismjs@1.29.0/components/prism-handlebars.js";
import "npm:prismjs@1.29.0/components/prism-ejs.js";
import "npm:prismjs@1.29.0/components/prism-jsx.js";

// Custom highlights
import "./_config/prism-tree.js";

const domainsRegExp = new RegExp('cloudcannon.com|^\/|^\#');

const site = lume({
    location: new URL("https://cloudcannon.com/documentation/"),
    server: {
        port: 9010,
    }
});

site.ignore("README.md");

// Sets `/documentation/` through the url filter when running locally
if (Deno.args.includes("-s") || Deno.args.includes("--serve")) {
    site.options.location = new URL("http://localhost:9010/documentation/");
}

// Output all files to `/documentation/*` to match the location
// (by default `_site/index.html` would represent `https://cloudcannon.com/documentation/`,
//  but to subpath it on CloudCannon we want this at `_site/documentation/index.html`)
site.preprocess("*", (page) => {
    page.data.url = `/documentation${page.data.url}`;
});

site.copy("ye_olde_images", "documentation/ye_olde_images");
site.copy("uploads", "documentation/static");

// Temporary trick to disable indented code blocks if we happen to use markdown-it
site.formats.get(".md").engines[0].engine.disable("code");

// Disable builtin Pagefind instance while we're pinned to a beta version,
// which must be pulled from a different repository.
// Remove from .cloudcannon/postbuild when enabling this.
/*
site.use(pagefind({
    binary: {
        version: "v0.11.0",
    },
    indexing: {
        bundleDirectory: "documentation/_pagefind",
    },    
}));
*/

site.use(jsx());
site.use(mdx());
site.use(prism());
site.use(esbuild());
site.use(sass());
site.use(date());
site.use(inline());
site.use(sitemap({
    filename: '/documentation/sitemap.xml'
}));

// JSX doesn't like to output some alpine attributes,
// so we write them with an `alpine` prefix and re-map them here.
const alpineRemaps = {
    "alpine:class": ":class",
    "alpine:click": "@click",
    "alpine:ssgchange": "@ssgchange.window",
}

function createLink(page, text, href) {
    const a = page.document.createElement('a');
    const linkText = page.document.createTextNode(text);
    a.appendChild(linkText);
    a.setAttribute('href', href);
    return a;
}

function appendTargetBlank(page, el) {
    if (el.hasAttribute("href")) {
        let href = el.getAttribute('href')
        if (!domainsRegExp.test(href)){
            el.setAttribute('target', '_blank')
            el.setAttribute('rel', 'noopener')
        }
    }
}

const codeAnnotationRegex = /^\/\*\s*(\d+|\*)\s*\*\/$|^(?:\/\/|#)\s*(\d+|\*)\s*|^<!--\s*(\d+|\*)\s*-->$/;
const annotateCodeBlocks = (page) => {
    page.document?.querySelectorAll('.token.comment').forEach((commentEl) => {
        if (!codeAnnotationRegex.test(commentEl.innerText)) return;

        const matches = commentEl.innerText.match(codeAnnotationRegex);
        const annotationId = matches[1] ?? matches[2] ?? matches[3];
        if (!annotationId) return;
        
        commentEl.innerText = "";
        commentEl.classList.add("annotation", "code-annotation");
        if (annotationId === "*") {
            commentEl.setAttribute("data-annotation-number", "★");
        } else {
            commentEl.setAttribute("data-annotation-number", annotationId);
            commentEl.setAttribute("@click", `highlighedAnnotation = ${annotationId}`);
        }
    });
}

site.process([".html"], (page) => {
    for (const [attr, newattr] of Object.entries(alpineRemaps)) {
        page.document?.querySelectorAll(`[${attr}]`).forEach((el) => {
            el.setAttribute(newattr, el.getAttribute(attr));
            el.removeAttribute(attr);
        });
    }

    const collisions = {};

    function fixIdCollisions(slugPrefix) {
        let slug = slugPrefix;
        let count = 0;
        while(collisions[slug]) {
            count += 1;
            slug = `${slugPrefix}-${count}`;
        }

        collisions[slug] = true;
        return slug;
    }

    const tocContainer = page.document?.querySelectorAll(`.l-toc`)?.[0];
    const toc = page.document.createElement('ol');
    toc.classList.add("l-toc__list");
    function appendAnchorHeader(el, slug) {
        el.setAttribute('id', slug);
        el.classList.add("c-anchor-header");
        const link = createLink(page, "#", `#${slug}`);
        link.classList.add("c-anchor-header__link");
        link.setAttribute("data-pagefind-ignore", "true");
        el.appendChild(link);
    }

    let hasItems = false;
    page.document?.querySelectorAll(`main h1, main h2, main h3`).forEach((el) => {
        const text = el.innerText;
        const slugPrefix = el.getAttribute('id') || slugify(text);
        if (!slugPrefix) {
            return;
        }
        const slug = fixIdCollisions(slugPrefix);
        appendAnchorHeader(el, slug);

        if (tocContainer) {
            hasItems = true;
            const li = page.document.createElement('li');
            li.appendChild(createLink(page, text, `#${slug}`));
            toc.appendChild(li);
        }
    });

    page.document?.querySelectorAll(`.c-data-reference__header`).forEach((el) => {
        const text = el.querySelector('.c-data-reference__key').innerText;
        const slug = fixIdCollisions(text);
        appendAnchorHeader(el, slug);
    });

    if (hasItems) {
        const h3 = page.document.createElement('h3');
        h3.classList.add("l-toc__heading");
        const headingText = page.document.createTextNode('On this page');
        h3.appendChild(headingText);
        tocContainer?.appendChild(h3);
        tocContainer?.appendChild(toc);
    }

    page.document?.querySelectorAll('a').forEach((el) => {
        appendTargetBlank(page, el);
    });

    annotateCodeBlocks(page);
});

// TODO: Redo docnav as JSX and move this logic into the component
const bubble_up_nav = (obj) => {
    if (obj._bubbled) return;
    if (obj._type === "heading" || obj._type === "group") {
        let articles = obj.items.flatMap(o => bubble_up_nav(o));
        obj._bubbled = articles;
        return articles;
    } else {
        // TODO: Temporary URL map, until a UUID refactor.
        return obj.articles?.map(a => `/documentation/articles/${a}/`) ?? [];
    }
}

site.filter("bubble_up_nav", (blocks) => {
    blocks.forEach(bubble_up_nav);
    return blocks
});

site.filter("index_of", (block, item) => {
    return block.indexOf(item);
});

const summaryMarker = '</p>';
site.filter("changelog_summary", (block, item) => {
    return block.substring(0, block.indexOf(summaryMarker) + summaryMarker.length);
});

/* Environment data */

let hubspot_id = Deno.env.get("HUBSPOT_ID");
if (!hubspot_id) {
    console.error("No HUBSPOT_ID environment variable set");
}
site.data("hubspot_id", hubspot_id || false);

let ga_id = Deno.env.get("GA_ID");
if (!ga_id) {
    console.error("No GA_ID environment variable set");
}
site.data("ga_id", ga_id || false);

let ga_verify = Deno.env.get("GA_VERIFICATION");
if (!ga_verify) {
    console.error("No GA_VERIFICATION environment variable set");
}
site.data("ga_verify", ga_verify || false);

export default site;
