import lume from "lume/mod.ts";
import icons from "lume/plugins/icons.ts";

import nunjucks from "lume/plugins/nunjucks.ts";

// import pagefind from "lume/plugins/pagefind.ts";
import date from "lume/plugins/date.ts";
import sass from "lume/plugins/sass.ts";
import inline from "lume/plugins/inline.ts";
import esbuild from "lume/plugins/esbuild.ts";
import prism from "lume/plugins/prism.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";

import jsx from "lume/plugins/jsx.ts";
import mdx from "lume/plugins/mdx.ts";

import { slugify } from "./_components/utils/stringHelpers.ts";

import { parse as yamlParse } from "jsr:@std/yaml@1.0.11";

// Data highlights
import "npm:prismjs@1.30.0/components/prism-yaml.js";
import "npm:prismjs@1.30.0/components/prism-json.js";
import "npm:prismjs@1.30.0/components/prism-toml.js";

// Lang highlights
import "npm:prismjs@1.30.0/components/prism-bash.js";
import "npm:prismjs@1.30.0/components/prism-ruby.js";
import "npm:prismjs@1.30.0/components/prism-scss.js";
import "npm:prismjs@1.30.0/components/prism-typescript.js";
import "npm:prismjs@1.30.0/components/prism-python.js";
import "npm:prismjs@1.30.0/components/prism-go.js";

// Required language dependencies for languages like liquid
import "npm:prismjs@1.30.0/components/prism-markup-templating.js";

// Template highlights
import "npm:prismjs@1.30.0/components/prism-markdown.js";
import "npm:prismjs@1.30.0/components/prism-liquid.js";
import "npm:prismjs@1.30.0/components/prism-jsx.js";

// Custom highlights
import "./_config/prism-tree.js";
import "./_config/prism-annotated.js";

import { DOMParser } from "jsr:@b-fuze/deno-dom@0.1.56";
import { join } from "jsr:@std/path@1.0.8";

//import { Page } from "lume/core.ts";
import { Element } from "lume/deps/dom.ts";
import { extract } from "lume/deps/front_matter.ts";

import { remark } from "npm:remark@15.0.1";
import remarkParse from "npm:remark-parse@11.0.0";
import strip from "npm:strip-markdown@6.0.0";

import { parseChangelogFilename } from "./parseChangelogFilename.ts";
import type { ContentNavItem, DocEntry } from "./_types.d.ts";
import {
  loadReferenceKeys,
  type ReferenceData,
} from "./_components/Reference/referenceDataHelpers.ts";

import documentation from "npm:@cloudcannon/configuration-types@0.0.48/dist/documentation.json" with {
  type: "json",
};
globalThis.DOCS = documentation as unknown as Record<string, DocEntry>;

// Load reference data files and convert to DocEntry arrays
async function loadReferenceData(): Promise<{
  routing: DocEntry[];
  initialSiteSettings: DocEntry[];
}> {
  let routingEntries: DocEntry[] = [];
  let initialSiteSettingsEntries: DocEntry[] = [];

  try {
    const routingYaml = await Deno.readTextFile(
      join(Deno.cwd(), "_data/reference/routing.yml"),
    );
    const routingData = yamlParse(routingYaml) as ReferenceData;
    routingEntries = loadReferenceKeys(routingData, "routing-file");
  } catch {
    console.warn("Could not load routing reference data");
  }

  try {
    const settingsYaml = await Deno.readTextFile(
      join(Deno.cwd(), "_data/reference/initial-site-settings.yml"),
    );
    const settingsData = yamlParse(settingsYaml) as ReferenceData;
    initialSiteSettingsEntries = loadReferenceKeys(
      settingsData,
      "initial-site-settings-file",
    );
  } catch {
    console.warn("Could not load initial-site-settings reference data");
  }

  return {
    routing: routingEntries,
    initialSiteSettings: initialSiteSettingsEntries,
  };
}

// Load reference data synchronously at startup
const referenceData = await loadReferenceData();

// Build timing instrumentation
const buildTimings: Record<string, number> = {};
const phaseStarts: Record<string, number> = {};

// Caches for expensive operations (persist across incremental builds)
const renderTextOnlyCache = new Map<string, string>();
const glossaryTermCache = new Map<string, string>();
const glossaryByLetterCache = new Map<string, object[]>();
const changelogDescriptionCache = new Map<string, string>();

// Reusable remark processor (avoid recreating on each call)
// deno-lint-ignore no-explicit-any
let remarkProcessor: any = null;
function getRemarkProcessor() {
  if (!remarkProcessor) {
    remarkProcessor = remark().use(remarkParse).use(strip);
  }
  return remarkProcessor;
}

function startPhase(name: string) {
  phaseStarts[name] = performance.now();
}

function endPhase(name: string) {
  buildTimings[name] = performance.now() - phaseStarts[name];
}

function stripHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc?.body?.textContent || "";
}

const domainsRegExp = new RegExp("cloudcannon.com|^\/|^\#");

const site = lume({
  location: new URL("https://cloudcannon.com/documentation/"),
  server: {
    port: 9010,
  },
});

site.data("full_docs", Object.values(documentation));
site.data("routing_docs", referenceData.routing);
site.data("initial_site_settings_docs", referenceData.initialSiteSettings);

// Track whether we're in an update cycle (vs initial build)
let isUpdating = false;
let updatePageCount = 0;

// Build timing event listeners
site.addEventListener("afterLoad", () => {
  endPhase("load");
  startPhase("render");
  if (!isUpdating) {
    console.log(`  Load files:    ${buildTimings.load.toFixed(0)}ms`);
  }
});

site.addEventListener("afterRender", (event) => {
  endPhase("render");
  startPhase("process");
  updatePageCount = event.pages.length;
  if (!isUpdating) {
    console.log(
      `  Render pages:  ${
        buildTimings.render.toFixed(0)
      }ms (${event.pages.length} pages)`,
    );
  }
});

site.addEventListener("beforeSave", () => {
  endPhase("process");
  startPhase("save");
  if (!isUpdating) {
    console.log(`  Process HTML:  ${buildTimings.process.toFixed(0)}ms`);
  }
});

site.addEventListener("afterBuild", (event) => {
  endPhase("save");
  endPhase("total");
  console.log(`  Save files:    ${buildTimings.save.toFixed(0)}ms`);
  console.log(`  ─────────────────────────`);
  console.log(`  TOTAL:         ${buildTimings.total.toFixed(0)}ms`);
  console.log(`  Pages built:   ${event.pages.length}`);
  console.log(`  Static files:  ${event.staticFiles.length}`);
  console.log("=== BUILD TIMING END ===\n");
});

// Incremental update timing (for watch mode)
site.addEventListener("beforeUpdate", (event) => {
  isUpdating = true;
  startPhase("update");
  startPhase("load");
  console.log(`\n=== UPDATE START (${event.files.size} files changed) ===`);
  for (const file of event.files) {
    console.log(`  Changed: ${file}`);
  }
});

site.addEventListener("afterUpdate", (event) => {
  endPhase("save");
  endPhase("update");
  console.log(`  ─────────────────────────`);
  console.log(`  Load files:    ${buildTimings.load.toFixed(0)}ms`);
  console.log(
    `  Render pages:  ${
      buildTimings.render.toFixed(0)
    }ms (${updatePageCount} pages)`,
  );
  console.log(`  Process HTML:  ${buildTimings.process.toFixed(0)}ms`);
  console.log(`  Save files:    ${buildTimings.save.toFixed(0)}ms`);
  console.log(`  ─────────────────────────`);
  console.log(`  TOTAL:         ${buildTimings.update.toFixed(0)}ms`);
  console.log(`  Pages rebuilt: ${event.pages.length}`);
  console.log("=== UPDATE END ===\n");
  isUpdating = false;
});

// Log the server URL when it starts (currently suppressed by LUME_LOGS=critical)
site.addEventListener("afterStartServer", () => {
  const port = site.options.server.port;
  console.log(
    `\n  Server running at: http://localhost:${port}/documentation/\n`,
  );
});

// Configure scoped updates for faster incremental rebuilds
// Files in each scope only rebuild when files in that scope change
site.scopedUpdates(
  // CSS/SCSS files are independent
  (path) => /\.(css|scss)$/.test(path),
);

site.use(nunjucks());
site.use(icons());

const injectedSections: Promise<string>[] = [];

const mdFilter = site.renderer.helpers.get("md")?.[0];

site.ignore("README.md", "articles", "changelogs", "unused", "guides");

// Detect dev mode (serve command uses -s flag)
const isDevMode = Deno.args.includes("-s") || Deno.args.includes("--serve");

// In dev mode, only load recent changelogs for faster builds
if (isDevMode) {
  site.ignore(
    "new_changelogs/2015",
    "new_changelogs/2016",
    "new_changelogs/2017",
    "new_changelogs/2018",
    "new_changelogs/2019",
    "new_changelogs/2020",
    "new_changelogs/2021",
    "new_changelogs/2022",
    "new_changelogs/2023",
  );
  console.log("  Dev mode: Loading only recent changelogs (2024-2025)");
}

// Sets `/documentation/` through the url filter when running locally
if (isDevMode) {
  site.options.location = new URL("http://localhost:9010/documentation/");
}

// Output all files to `/documentation/*` to match the location
// (by default `_site/index.html` would represent `https://cloudcannon.com/documentation/`,
//  but to subpath it on CloudCannon we want this at `_site/documentation/index.html`)
site.preprocess("*", (pages) =>
  pages.forEach((page) => {
    page.data.url = `/documentation${page.data.url}`;
  }));

// Creates an excerpt for all changelogs saved in description.
site.preprocess([".md", ".mdx"], (pages) =>
  pages.forEach((page) => {
    if (
      !page.data.description && page.src.path.startsWith("/new_changelogs/")
    ) {
      const parsedDate = parseChangelogFilename(page.src.path);
      if (parsedDate) {
        page.data.date = parsedDate;
      }

      const firstLine = String(page.data.content).trim().split("\n")[0];
      if (!firstLine) {
        return;
      }

      // Cache key based on path + first line (description only depends on these)
      const cacheKey = `${page.src.path}:${firstLine}`;
      const cached = changelogDescriptionCache.get(cacheKey);
      if (cached) {
        page.data.description = cached;
        return;
      }

      const markdownInline = mdFilter?.(firstLine, true) || "";
      const description = stripHTML(markdownInline);
      changelogDescriptionCache.set(cacheKey, description);
      page.data.description = description;
    }
  }));

site.copy("ye_olde_images", "documentation/ye_olde_images");
site.copy("uploads", "documentation/static");

// Temporary trick to disable indented code blocks if we happen to use markdown-it
// deno-lint-ignore no-explicit-any
(site.formats.get(".md")?.engines?.[0] as any)?.engine?.disable?.("code");

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
site.add("/assets/js/site.js");
site.copy("/assets/js/custom-live.js");

site.use(sass());
site.add("/assets/css/site.scss");

site.add("/assets/img");
// Uploads are copied via site.copy() above - don't also add them here
// site.add("/uploads");

site.use(date());
site.use(sitemap({
  items: {
    filename: "=/documentation/sitemap.xml",
  },
  // deno-lint-ignore no-explicit-any
} as any));

// Changelog RSS feed - uses changelogs tag (year pages use changelog-year tag instead)
site.use(feed({
  output: ["/documentation/changelog/feed.xml"],
  query: "changelogs",
  sort: "date=desc",
  limit: 20,
  info: {
    title: "CloudCannon Documentation Changelog",
    description: "Latest updates and changes to CloudCannon",
  },
  items: {
    title: "=title",
    description: "=description",
    published: "=date",
    content: "=children",
  },
}));

// deno-lint-ignore no-explicit-any
site.loadPages(
  [".md"],
  ((page: any) => {
    if (page.src.path.startsWith("user/glossary/")) {
      page.data.collection = "glossary";
    }
  }) as unknown as undefined,
);

// JSX doesn't like to output some alpine attributes,
// so we write them with an `alpine` prefix and re-map them here.
const alpineRemaps = {
  "alpine:class": ":class",
  "alpine:click": "@click",
  "alpine:href": ":href",
  "alpine:src": ":src",
  "alpine:style": ":style",
  "alpine:key": ":key",
  "alpine-click-stop": "@click.stop",
  "alpine-click-away": "@click.away",
  "alpine-click-outside": "@click.outside",
  "alpine:checked": ":checked",
  "alpine:scroll": "x-on:scroll.window.throttle.50ms",
  "alpine-scroll-window": "@scroll.window",
  "alpine-resize-window": "@resize.window",
  "alpine-keydown-down": "@keydown.down",
  "alpine-keydown-up": "@keydown.up",
  "alpine-keydown-escape": "@keydown.escape",
  "alpine-keydown-window-prevent-ctrl-k": "@keydown.window.prevent.ctrl.k",
  "alpine-keydown-window-prevent-cmd-k": "@keydown.window.prevent.cmd.k",
  "x-trap-inert": "x-trap.inert",
  "x-trap-noscroll": "x-trap.noscroll",
};

function createLink(page: Lume.Page, text: string, href: string) {
  const a = page.document!.createElement("a");
  const linkText = page.document!.createTextNode(text);
  a.appendChild(linkText);
  a.setAttribute("href", href);
  return a;
}

function appendTargetBlank(_page: Lume.Page, el: Element): void {
  if (el.hasAttribute("href")) {
    const href = el.getAttribute("href");
    if (href && !domainsRegExp.test(href)) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    }
  }
}

const commentAnnotationRegex =
  /^\/\*\s*(\d+|\*)\s*\*\/$|^(?:\/\/|#)\s*(\d+|\*)\s*|^<!--\s*(\d+|\*)\s*-->$/;
const tokenAnnotationRegex = /___(\d+|\*)___/g;
const annotateCodeBlocks = (page: Lume.Page): void => {
  // Comment tokens for standard code blocks, annotations
  // are inserted for syntax comments containing only digits
  page.document?.querySelectorAll(".token.comment").forEach((commentEl) => {
    const el = commentEl as HTMLElement;
    if (!commentAnnotationRegex.test(el.innerText)) return;

    const matches = el.innerText.match(commentAnnotationRegex);
    const annotationId = matches?.[1] ?? matches?.[2] ?? matches?.[3];
    if (!annotationId) return;

    // Empty the comment token and replace it with a clickable annotation box
    el.innerText = "";
    el.classList.add("annotation", "code-annotation");
    if (annotationId === "*" || annotationId === "0") {
      el.setAttribute("data-annotation-number", "★");
    } else {
      el.setAttribute("data-annotation-number", annotationId);
      el.setAttribute("@click", `highlighedAnnotation = ${annotationId}`);
    }
  });

  // Any text for MultiCodeBlocks, annotations are inserted any time
  // a digit surrounded by three underscores on either side is encountered
  page.document?.querySelectorAll(".highlight > pre > code").forEach(
    (codeEl) => {
      [...codeEl.childNodes].reverse().forEach((tokenEl) => {
        const token = tokenEl as HTMLElement & { nodeValue?: string };
        const is_text = token.nodeName === "#text";
        if (
          !tokenAnnotationRegex.test(
            is_text ? (token.nodeValue || "") : (token.innerText || ""),
          )
        ) return;

        const matches = (is_text ? token.nodeValue : token.innerText)?.match(
          tokenAnnotationRegex,
        );
        for (const match of matches || []) {
          const annotationId = match.replace(/___/g, "");
          if (!annotationId) continue;

          // Create a new empty comment token as a clickable annotation box
          const commentEl = page.document?.createElement("span");
          commentEl.classList.add(
            "token",
            "comment",
            "annotation",
            "code-annotation",
          );
          if (annotationId === "*" || annotationId === "0") {
            commentEl.setAttribute("data-annotation-number", "★");
          } else {
            commentEl.setAttribute("data-annotation-number", annotationId);
            commentEl.setAttribute(
              "@click",
              `highlighedAnnotation = ${annotationId}`,
            );
          }

          // To insert after the token containing the annotation
          // const insert_before_el = token.nextSibling || token;

          // To insert at the end of the line containing the annotation
          let next_newline: ChildNode | null = null;
          let next_el: ChildNode | null = token;
          while (next_el && !next_newline) {
            const nodeEl = next_el as HTMLElement & { nodeValue?: string };
            if (
              /\n/.test(nodeEl?.nodeValue ?? "") ||
              /\n/.test(nodeEl?.innerText ?? "")
            ) {
              next_newline = next_el;
              break;
            }
            next_el = next_el.nextSibling;
          }
          let insert_before_el: ChildNode | null = next_newline || token;

          // Text nodes might span multiple lines, so we split it on newlines
          // and re-add each as independent text nodes, so that we can add an element before
          // the newline.
          const insertNodeValue = (insert_before_el as Text)?.nodeValue;
          if (insertNodeValue && /\n/.test(insertNodeValue)) {
            const chunks = insertNodeValue
              .split("\n")
              .map((chunk: string) => page.document!.createTextNode(chunk));
            for (let i = 0; i < chunks.length; i += 1) {
              insert_before_el?.parentNode?.insertBefore(
                chunks[i],
                insert_before_el,
              );
              if (i !== chunks.length - 1) {
                insert_before_el?.parentNode?.insertBefore(
                  page.document!.createTextNode("\n"),
                  insert_before_el,
                );
              }
            }
            insert_before_el?.remove();
            insert_before_el = chunks[0].nextSibling;
          }
          insert_before_el?.parentNode?.insertBefore(
            commentEl,
            insert_before_el,
          );
        }

        if (is_text) {
          token.nodeValue = (token.nodeValue || "").replace(
            tokenAnnotationRegex,
            "",
          );
        } else {
          token.innerText = (token.innerText || "").replace(
            tokenAnnotationRegex,
            "",
          );
        }
      });
    },
  );
};

const injectReusableContent = async (el: Element) => {
  const reusableContent = el.querySelectorAll(
    `:scope [data-common-content-id]`,
  );

  for (const node of reusableContent) {
    const injectionEl = node as Element;
    const injectionSlots: Record<string, string> = {};
    for (
      const slotContentEl of injectionEl.querySelectorAll(
        `:scope [data-common-content-slot-content]`,
      )
    ) {
      const slotName = (slotContentEl as Element).getAttribute(
        "data-common-content-slot-content",
      );
      if (!slotName) continue;

      injectionSlots[slotName] = (slotContentEl as Element).innerHTML;
    }

    const content_id = parseInt(
      injectionEl.getAttribute("data-common-content-id")!,
    );
    const content = await injectedSections[content_id];
    injectionEl.innerHTML = content?.toString() || content;

    for (
      const slotEl of injectionEl.querySelectorAll(
        `:scope [data-common-content-slot]`,
      )
    ) {
      const slotName = (slotEl as Element).getAttribute(
        "data-common-content-slot",
      );
      if (!slotName) continue;

      if (injectionSlots[slotName]) {
        (slotEl as Element).innerHTML = injectionSlots[slotName];
      }
    }

    injectReusableContent(injectionEl);
  }
};

site.process([".html"], async (pages) => {
  await Promise.all(pages.map(async (page) => {
    if (page.document) {
      await injectReusableContent(page.document.body as unknown as Element);
    }

    // Helper function to remap Alpine attributes
    // deno-lint-ignore no-explicit-any
    function remapAlpineAttrs(root: any): void {
      for (const [attr, newattr] of Object.entries(alpineRemaps)) {
        root?.querySelectorAll(`[${attr}]`).forEach(
          (
            el: {
              setAttribute: (a: string, b: string) => void;
              getAttribute: (a: string) => string | null;
              removeAttribute: (a: string) => void;
            },
          ) => {
            el.setAttribute(newattr, el.getAttribute(attr) || "");
            el.removeAttribute(attr);
          },
        );
      }
      // Also process elements inside <template> tags
      // deno-lint-ignore no-explicit-any
      root?.querySelectorAll("template").forEach((template: any) => {
        if (template.content) {
          remapAlpineAttrs(template.content);
        }
      });
    }

    remapAlpineAttrs(page.document);

    const collisions: Record<string, boolean> = {};

    function fixIdCollisions(slugPrefix: string): string {
      let slug = slugPrefix;
      let count = 0;
      while (collisions[slug]) {
        count += 1;
        slug = `${slugPrefix}-${count}`;
      }

      collisions[slug] = true;
      return slug;
    }

    let tocContainer = page.document?.querySelectorAll(`.l-toc`)?.[0];
    const toc = page.document.createElement("ol");
    toc.classList.add("l-toc__list");
    // deno-lint-ignore no-explicit-any
    function appendAnchorHeader(el: any, slug: string): void {
      el.setAttribute("id", slug);
      el.classList.add("c-anchor-header");
      const link = createLink(page, "#", `#${slug}`);
      link.classList.add("c-anchor-header__link");
      link.setAttribute("data-pagefind-ignore", "true");
      el.appendChild(link);
    }

    let hasItems = false;
    let selector =
      `main h1:not(.exclude-from-toc), main h2:not(.exclude-from-toc)`;

    if (!tocContainer) {
      tocContainer = page.document?.querySelectorAll(`.l-toc-changelog-list`)
        ?.[0];
      if (tocContainer) {
        selector = `main .changelog-entry > h2`;
      }
    }

    if (!tocContainer) {
      tocContainer = page.document?.querySelectorAll(`.l-toc-glossary`)?.[0];
      if (tocContainer) {
        selector = `main .c-card--glossary .c-card__title`;
      }
    }

    if (!tocContainer) {
      return;
    }

    page.document?.querySelectorAll(selector).forEach((el) => {
      if (el.hasAttribute("data-skip-anchor")) return;

      const text = (el as HTMLElement).innerText || el.textContent || "";
      const slugPrefix = el.getAttribute("id") || slugify(text);
      if (!slugPrefix) {
        return;
      }
      const slug = fixIdCollisions(slugPrefix);
      appendAnchorHeader(el, slug);

      if (tocContainer) {
        hasItems = true;
        const li = page.document!.createElement("li");
        li.setAttribute(
          "x-bind:class",
          `visibleHeadingId === '${slug}' ? 'active' : ''`,
        );

        li.appendChild(createLink(page, text, `#${slug}`));
        toc.appendChild(li);
      }
    });

    page.document?.querySelectorAll(`.c-data-reference__header`).forEach(
      (el) => {
        const keyEl = el.querySelector(".c-data-reference__key") as
          | HTMLElement
          | null;
        const text = keyEl?.innerText || keyEl?.textContent || "";
        const slug = fixIdCollisions(text);
        appendAnchorHeader(el, slug);
      },
    );

    if (hasItems) {
      const h3 = page.document.createElement("h3");
      h3.classList.add("l-toc__heading");
      const headingText = page.document.createTextNode("Table of contents");
      h3.appendChild(headingText);
      tocContainer?.appendChild(h3);
      tocContainer?.appendChild(toc);
    }

    page.document?.querySelectorAll("a").forEach((el) => {
      appendTargetBlank(page, el as unknown as Element);
    });

    const mobile_toc = page.document?.querySelector(
      ".l-toc-mobile > .l-toc__list",
    );
    if (mobile_toc) {
      mobile_toc.innerHTML = toc?.innerHTML || "";
      if (!toc || toc.childNodes.length == 0) {
        mobile_toc.closest(".l-toc-mobile")?.remove();
      }
    }
  }));
});

// These MUST appear after our custom site.process([".html"] handling,
// as in that function we inject content that should then be processed by the inline plugin,
// and processing runs in the order it was instantiated.
// Note: inline should be used before feed per lume best practices, but we need it after our custom HTML processing
// deno-lint-ignore lume/plugin-order
site.use(inline());
site.use(prism());

// This annotation process relies on the syntax highlighting,
// so needs to run after prism
site.process([".html"], async (pages) => {
  await Promise.all(pages.map((page) => {
    annotateCodeBlocks(page);
  }));
});

site.filter(
  "get_by_uuid",
  (resources: Array<{ _uuid?: string }>, uuid: string) => {
    const found = resources.filter((x: { _uuid?: string }) => x._uuid === uuid);
    if (found && found.length > 0) {
      return found[0];
    }
    return null;
  },
);

site.filter("is_gid_inside", (gid: string | undefined, parentGid: string) => {
  if (gid) {
    return parentGid === "type.Configuration"
      ? !gid.startsWith("type.")
      : gid.startsWith(`${parentGid}.`);
  } else return false;
});

site.filter("get_docs_by_gid", (gid: string) => {
  const found = Object.values(DOCS).filter((x) => x.gid === gid);
  if (found && found.length > 0) {
    return found[0];
  }
  return null;
});

site.filter("get_docs_by_ref", (docRef: DocEntry) => {
  const doc = DOCS[docRef.gid || ""] || docRef;

  if (docRef.documentation) {
    // Use more specific documentation entry
    return {
      ...doc,
      title: docRef.documentation.title || doc.title,
      description: docRef.documentation.description || doc.description,
      examples: docRef.documentation.examples?.length
        ? docRef.documentation.examples
        : doc.documentation?.examples,
      documentation: docRef.documentation,
    };
  }

  return doc;
});

site.filter("parent_gids_from_doc", (doc: DocEntry) => {
  const parentGids: string[] = [];
  let parentGid = doc.parent;
  while (parentGid) {
    parentGids.unshift(parentGid);
    parentGid = DOCS[parentGid]?.parent;
  }
  return parentGids;
});

site.filter("get_by_letter", async (_resources, letter) => {
  // Check cache first
  const cacheKey = letter.toLowerCase();
  const cached = glossaryByLetterCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const dir = join(
    Deno.cwd(),
    "user",
    "glossary",
    cacheKey,
  );
  const entries = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      const file_content = Deno.readTextFileSync(`${dir}/${entry.name}`);
      const yml = yamlParse(file_content);
      entries.push(yml);
    }
    entries.sort((a, b) =>
      a.glossary_term_name < b.glossary_term_name ? -1 : 1
    );
  } catch (error) {
    // Directory doesn't exist, return empty array
    if (error instanceof Deno.errors.NotFound) {
      glossaryByLetterCache.set(cacheKey, []);
      return [];
    }
    throw error; // Re-throw other errors
  }
  glossaryByLetterCache.set(cacheKey, entries);
  return entries;
}, true);

// TODO: Redo docnav as JSX and move this logic into the component
const bubble_up_nav = (obj: ContentNavItem): string[] | undefined => {
  if (obj._bubbled) return;
  if (obj._type === "heading" || obj._type === "group") {
    const articles = obj.items
      ? obj.items.flatMap((o: ContentNavItem) => bubble_up_nav(o) || [])
      : [];
    obj._bubbled = articles;
    return articles;
  } else {
    // TODO: Temporary URL map, until a UUID refactor.
    return obj.articles;
  }
};

site.filter("render_page_content", async (page: Lume.Page) => {
  return await site.renderer.render(
    page.data.content,
    page.data,
    `${page.src.path}.${page.src.ext || "mdx"}`,
  );
}, true);

site.filter("render_text_only", async (markdown: string) => {
  // Check cache first
  const cached = renderTextOnlyCache.get(markdown);
  if (cached !== undefined) {
    return cached;
  }

  const result = await getRemarkProcessor().process(markdown);
  const text = String(result).trim();
  renderTextOnlyCache.set(markdown, text);
  return text;
}, true);

site.filter("bubble_up_nav", (blocks: ContentNavItem[]) => {
  blocks.forEach(bubble_up_nav);
  return blocks;
});

site.filter(
  "nav_contains",
  (nav: { headings: ContentNavItem[] }, url: string) => {
    nav.headings.forEach(bubble_up_nav);
    for (const block of nav.headings) {
      if (block._bubbled?.includes(url)) {
        return true;
      }
    }
    return false;
  },
);

site.filter("index_of", (block: unknown[], item: unknown) => {
  return block.indexOf(item);
});

site.filter("unslug", (str: string) => {
  return str.replace(
    /(^|_)(\w)/g,
    (_: string, u: string, c: string) =>
      `${u.replace("_", " ")}${c.toUpperCase()}`,
  );
});

const summaryMarker = "</p>";
site.filter("changelog_summary", (block: string, _item: unknown) => {
  return block.substring(
    0,
    block.indexOf(summaryMarker) + summaryMarker.length,
  );
});

site.filter(
  "render_common",
  (file: string, data: Record<string, unknown> = {}) => {
    // TODO: Remove the `/usr/local/__site/src/` replacement after fixing path selection
    const file_content = Deno.readTextFileSync(
      file.replace("/usr/local/__site/src/", ""),
    );
    const { body } = extract(file_content);
    const content_id = injectedSections.push(
      site.renderer.render(body, data, file),
    );

    return content_id - 1;
  },
);

site.filter("get_glossary_term", (file: string) => {
  // Check cache first
  const cached = glossaryTermCache.get(file);
  if (cached !== undefined) {
    return cached;
  }

  const mdFilterFn = site.renderer.helpers.get("md")?.[0];
  const file_content = Deno.readTextFileSync(`${file.slice(1)}`);
  // deno-lint-ignore no-explicit-any
  const yml = yamlParse(file_content) as any;
  const description = mdFilterFn?.(yml?.term_description) || "";
  glossaryTermCache.set(file, description);
  return description;
});

site.filter("get_index_page", (page: string) => {
  page = page.replace("/documentation", "").split("/")[1];
  if (page.indexOf("-") != -1) {
    try {
      const page_parts = page.split("-");
      const file_content = Deno.readTextFileSync(
        `${page_parts[0]}/${page_parts[1]}/index.mdx`,
      );
      const { attrs } = extract(file_content);
      return {
        attrs: attrs as Record<string, unknown>,
        url: `/documentation/${page_parts[0]}-${page_parts[1]}/`,
      };
    } catch (_e) {
      //console.log(e);
    }
  }
  //else
  //console.log("no")

  return null;
});

let changelogsData: { keys: string[]; [year: string]: number | string[] } = {
  keys: [],
};

site.addEventListener("beforeBuild", async () => {
  startPhase("total");
  startPhase("load");
  console.log("\n=== BUILD TIMING START ===");
  const dir = "new_changelogs";
  const years: { keys: string[]; [year: string]: number | string[] } = {
    keys: [],
  };

  for await (const entry of Deno.readDir(dir)) {
    if (entry.isDirectory) {
      const dirname = entry.name;
      years.keys.push(dirname);
      years[dirname] = 0;
      const subdir = `${dir}/${dirname}`;
      for await (const entry of Deno.readDir(subdir)) {
        if (entry.isFile) {
          (years[dirname] as number)++;
        }
      }
    }
  }

  years.keys.sort((a, b) => Number(b) - Number(a));

  changelogsData = years;
});

site.data("changelog_years", () => changelogsData);
site.data(
  "all_letters",
  () => [...Array(26).keys()].map((n) => String.fromCharCode(65 + n)),
);

/* Environment data */

const hubspot_id = Deno.env.get("HUBSPOT_ID");
if (!hubspot_id) {
  console.error("No HUBSPOT_ID environment variable set");
}
site.data("hubspot_id", hubspot_id || false);

const ga_id = Deno.env.get("GA_ID");
if (!ga_id) {
  console.error("No GA_ID environment variable set");
}
site.data("ga_id", ga_id || false);

const ga_verify = Deno.env.get("GA_VERIFICATION");
if (!ga_verify) {
  console.error("No GA_VERIFICATION environment variable set");
}
site.data("ga_verify", ga_verify || false);

export default site;
