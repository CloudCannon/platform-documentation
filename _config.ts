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
import "./_config/prism-annotated.js";

import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { Page } from "lume/core.ts";
import { Element, Node } from "lume/deps/dom.ts";
import { extract } from "lume/deps/front_matter.ts";

function stripHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
}


const domainsRegExp = new RegExp('cloudcannon.com|^\/|^\#');

const site = lume({
    location: new URL("https://cloudcannon.com/documentation/"),
    server: {
        port: 9010,
    }
});

const injectedSections: Promise<string>[] = [];

const mdFilter = site.renderer.helpers.get('md')[0];

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

// Creates an excerpt for all changelogs saved in description.
site.preprocess(['.md', '.mdx'], (page) => {
    if (!page.data.description && page.src.path.startsWith('/changelogs/')) {
        const firstLine = page.data.content.trim().split('\n')[0];
        if (!firstLine) {
            return;
        }

        const markdownInline = mdFilter(firstLine, true) || '';
        page.data.description = stripHTML(markdownInline);
    }
});

site.copy("ye_olde_images", "documentation/ye_olde_images");
site.copy("uploads", "documentation/static");

// Temporary trick to disable indented code blocks if we happen to use markdown-it
site.formats.get(".md").engines[0].engine.disable("code");

// Disable builtin Pagefind instance while we're pinned to a beta version,
// which must be pulled from a different repository.
// Remove from .cloudcannon/postbuild when enabling this.

// site.use(pagefind({
//     binary: {
//         version: "v1.0.3",
//     },
//     indexing: {
//         bundleDirectory: "documentation/_pagefind",
//     },    
// }));


site.use(jsx());
site.use(mdx());
site.use(esbuild());
site.use(sass());
site.use(date());
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

const commentAnnotationRegex = /^\/\*\s*(\d+|\*)\s*\*\/$|^(?:\/\/|#)\s*(\d+|\*)\s*|^<!--\s*(\d+|\*)\s*-->$/;
const tokenAnnotationRegex = /___(\d+|\*)___/g;
const annotateCodeBlocks = (page) => {
    // Comment tokens for standard code blocks, annotations
    // are inserted for syntax comments containing only digits
    page.document?.querySelectorAll('.token.comment').forEach((commentEl) => {
        if (!commentAnnotationRegex.test(commentEl.innerText)) return;

        const matches = commentEl.innerText.match(commentAnnotationRegex);
        const annotationId = matches[1] ?? matches[2] ?? matches[3];
        if (!annotationId) return;
        
        // Empty the comment token and replace it with a clickable annotation box
        commentEl.innerText = "";
        commentEl.classList.add("annotation", "code-annotation");
        if (annotationId === "*") {
            commentEl.setAttribute("data-annotation-number", "★");
        } else {
            commentEl.setAttribute("data-annotation-number", annotationId);
            commentEl.setAttribute("@click", `highlighedAnnotation = ${annotationId}`);
        }
    });


    // Any text for MultiCodeBlocks, annotations are inserted any time
    // a digit surrounded by three underscores on either side is encountered
    page.document?.querySelectorAll('.highlight > pre > code').forEach((codeEl) => {
        [...codeEl.childNodes].reverse().forEach((tokenEl) => {
            const is_text = tokenEl.nodeName === "#text";
            if (!tokenAnnotationRegex.test(is_text ? tokenEl.nodeValue : tokenEl.innerText)) return;

            const matches = (is_text ? tokenEl.nodeValue : tokenEl.innerText).match(tokenAnnotationRegex);
            for (const match of matches) {
                const annotationId = match.replace(/___/g, "");
                if (!annotationId) continue;

                // Create a new empty comment token as a clickable annotation box
                const commentEl = page.document?.createElement('span');
                commentEl.classList.add("token", "comment", "annotation", "code-annotation");
                if (annotationId === "*" || annotationId === "0") {
                    commentEl.setAttribute("data-annotation-number", "★");
                } else {
                    commentEl.setAttribute("data-annotation-number", annotationId);
                    commentEl.setAttribute("@click", `highlighedAnnotation = ${annotationId}`);
                }

                // To insert after the token containing the annotation
                // const insert_before_el = tokenEl.nextSibling || tokenEl;

                // To insert at the end of the line containing the annotation
                let next_newline = null;
                let next_el = tokenEl;
                while (next_el && !next_newline) {
                    if (/\n/.test(next_el?.nodeValue ?? "") || /\n/.test(next_el?.innerText ?? "")) {
                        next_newline = next_el;
                        break;
                    }
                    next_el = next_el.nextSibling;
                }
                let insert_before_el = next_newline || tokenEl;

                // Text nodes might span multiple lines, so we split it on newlines
                // and re-add each as independent text nodes, so that we can add an element before
                // the newline.
                if (/\n/.test(insert_before_el?.nodeValue || "")) {
                    const chunks = insert_before_el?.nodeValue
                                    .split("\n")
                                    .map(chunk => page.document.createTextNode(chunk));
                    for (let i = 0; i < chunks.length; i += 1) {
                        insert_before_el.parentNode.insertBefore( chunks[i], insert_before_el);
                        if (i !== chunks.length-1) {
                            insert_before_el.parentNode.insertBefore(page.document.createTextNode("\n"), insert_before_el);
                        }
                    }
                    insert_before_el.remove();
                    insert_before_el = chunks[0].nextSibling;
                }
                insert_before_el.parentNode.insertBefore(commentEl, insert_before_el);
            }

            if (is_text) {
                tokenEl.nodeValue = tokenEl.nodeValue.replace(tokenAnnotationRegex, "");
            } else {
                tokenEl.innerText = tokenEl.innerText.replace(tokenAnnotationRegex, "");
            }
        });
    });
}

const injectReusableContent = async (el: Element) => {
    const reusableContent = el.querySelectorAll(`:scope [data-common-content-id]`);

    for (const node of reusableContent) {
        const injectionEl = node as Element;
        const injectionSlots: Record<string, string> = {};
        for (const slotContentEl of injectionEl.querySelectorAll(`:scope [data-common-content-slot-content]`)) {
            const slotName = (slotContentEl as Element).getAttribute("data-common-content-slot-content");
            if (!slotName) continue;

            injectionSlots[slotName] = (slotContentEl as Element).innerHTML;
        }

        const content_id = parseInt(injectionEl.getAttribute("data-common-content-id")!);
        const content = await injectedSections[content_id];
        injectionEl.innerHTML = content?.toString() || content;

        for (const slotEl of injectionEl.querySelectorAll(`:scope [data-common-content-slot]`)) {
            
            const slotName = (slotEl as Element).getAttribute("data-common-content-slot");
            if (!slotName) continue;

            if (injectionSlots[slotName]) {
                (slotEl as Element).innerHTML = injectionSlots[slotName];
            }
        }

        injectReusableContent(injectionEl);
    }
}

site.process([".html"], async (page) => {
    if (page.document) await injectReusableContent(page.document.body);

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
        if (el.hasAttribute("data-skip-anchor")) return;

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
});

// These MUST appear after our custom site.process([".html"] handling,
// as in that function we inject content that should then be processed by the inline plugin,
// and processing runs in the order it was instantiated.
site.use(inline());
site.use(prism());

// This annotation process relies on the syntax highlighting,
// so needs to run after prism
site.process([".html"], async (page) => {
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

site.filter("render_page_content", async (page: Page) => {
    return await site.renderer.render(page.data.content, page.data, `${page.src.path}.${page.src.ext || "mdx"}`);
}, true)

site.filter("bubble_up_nav", (blocks) => {
    blocks.forEach(bubble_up_nav);
    return blocks
});

site.filter("nav_contains", (nav, url) => {
    nav.headings.forEach(bubble_up_nav);
    for (const block of nav.headings) {
        if (block._bubbled.includes(url)) {
            return true;
        }
    }
    return false;
});

site.filter("index_of", (block, item) => {
    return block.indexOf(item);
});

site.filter("unslug", (str) => {
    return str.replace(/(^|_)(\w)/g, (_, u, c) => `${u.replace('_', ' ')}${c.toUpperCase()}`);
})

const summaryMarker = '</p>';
site.filter("changelog_summary", (block, item) => {
    return block.substring(0, block.indexOf(summaryMarker) + summaryMarker.length);
});

site.filter("render_common", (file: string, data: object = {}) => {
    // TODO: Remove the `/usr/local/__site/src/` replacement after fixing path selection
    const file_content = Deno.readTextFileSync(file.replace("/usr/local/__site/src/", ""));
    const {body, attrs} = extract(file_content);
    const content_id = injectedSections.push(site.renderer.render(body, data, file));

    return content_id - 1;
})

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
