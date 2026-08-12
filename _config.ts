import lume from "lume/mod.ts";
import icons from "lume/plugins/icons.ts";

import pagefind from "./_plugins/pagefind.ts";
import date from "lume/plugins/date.ts";
import sass from "lume/plugins/sass.ts";
import inline from "lume/plugins/inline.ts";
import esbuild from "lume/plugins/esbuild.ts";
import prism from "lume/plugins/prism.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import basePath from "lume/plugins/base_path.ts";

import jsx from "lume/plugins/jsx.ts";
import mdx from "lume/plugins/mdx.ts";

import { slugify } from "./_components/utils/string-util.ts";

import { parse as yamlParse } from "@std/yaml";

// Data highlights
import "prismjs/components/prism-yaml.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-toml.js";

// Lang highlights
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-ruby.js";
import "prismjs/components/prism-scss.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-go.js";

// Required language dependencies for languages like liquid
import "prismjs/components/prism-markup-templating.js";

// Template highlights
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-liquid.js";
import "prismjs/components/prism-jsx.js";

// Custom highlights
import "./_config/prism-tree.ts";
import "./_config/prism-annotated.ts";

import { DOMParser } from "@b-fuze/deno-dom";

//import { Page } from "lume/core.ts";
import { Element } from "lume/deps/dom.ts";
import { extract } from "lume/deps/front_matter.ts";

import { remark } from "remark";
import remarkParse from "remark-parse";
import strip from "strip-markdown";

import { parseChangelogFilename } from "./parseChangelogFilename.ts";
import type { ContentNavItem, DocEntry } from "./_types.d.ts";
import {
  buildCliRefNav,
  buildRefNav,
} from "./developer/reference/_shared/buildRefNav.ts";
import {
  API_BASE_PATH,
  API_SCHEMAS_BASE_PATH,
  getApiResources,
  getApiSchemas,
} from "./developer/reference/api/_shared/openapi.ts";
import { buildVeapiDocs, VEAPI_SECTION } from "./_lib/veapi-docs.ts";
import {
  cliCommandPath,
  cliCommandUrl,
  walkCommands,
} from "./developer/reference/_shared/command-line-interface.ts";

import documentation from "@cloudcannon/configuration-types/dist/documentation.json" with {
  type: "json",
};
import llmsTxt from "./_config/llms-text.ts";
import markdownPages from "./_config/markdown-pages.ts";
import { cliDocs } from "./developer/reference/_shared/command-line-interface.ts";

// Type the documentation as nested sections (section -> gid -> entry)
const typedDocs = documentation as unknown as Record<
  string,
  Record<string, DocEntry>
>;

// Parse the Visual Editor API TypeScript declarations (JSDoc -> DocEntry) at
// build time and merge them in as their own section, so the reference section
// and article tables render from the same source and stay in sync.
typedDocs[VEAPI_SECTION] = await buildVeapiDocs();

// Store nested documentation structure for section-aware lookups
globalThis.DOCS = typedDocs;

// Partition documentation entries by section for layouts
const routingDocs: DocEntry[] = Object.values(
  typedDocs["type.Routing"] ?? {},
);
const initialSiteSettingsDocs: DocEntry[] = Object.values(
  typedDocs["type.InitialSiteSettings"] ?? {},
);
const configDocs: DocEntry[] = Object.values(
  typedDocs["type.Configuration"] ?? {},
);
const veapiDocs: DocEntry[] = Object.values(
  typedDocs[VEAPI_SECTION] ?? {},
);

// Pre-compute the flat reference-nav items array for the sidebar filter, once
// at build time. Written to a static JS file that assigns to window.__refNavItems.
// Avoids embedding ~100KB of JSON in the x-data attribute of every reference
// page (~700 pages), which was blowing the build's V8 heap during processing.
{
  const sectionInfo: Array<[string, string, string]> = [
    ["type.Configuration", "Configuration File", "/configuration-file/"],
    ["type.Routing", "Routing File", "/routing-file/"],
    [
      "type.InitialSiteSettings",
      "Initial Site Settings File",
      "/initial-site-settings-file/",
    ],
    ["type.VisualEditorAPI", "Visual Editor API", "/visual-editor-api/"],
  ];

  // Utility pages that live under /developer-reference/ but aren't schema-derived.
  const utilityPages: Array<{ url: string; title: string }> = [
    { url: "/developer-reference/", title: "Developer Reference" },
    {
      url: "/developer-reference/editable-regions/",
      title: "Editable Regions",
    },
    { url: "/developer-reference/permissions/", title: "Permissions" },
    { url: "/developer-reference/schemas/", title: "JSON Schemas" },
    { url: "/developer-reference/typescript/", title: "TypeScript Types" },
    {
      url: "/developer-reference/visual-editor-api/",
      title: "Visual Editor API",
    },
    { url: "/developer-reference/cli/", title: "CLI" },
    { url: "/developer-reference/sdk/", title: "SDK" },
    { url: "/developer-reference/api/", title: "API" },
  ];

  const basePath = "/documentation";
  const seenUrls = new Set<string>();
  const items: Array<{
    name: string;
    url: string;
    section: string;
    path: string;
    parent: string;
    depth: number;
    useCode: boolean;
  }> = [];

  for (const p of utilityPages) {
    const url = `${basePath}${p.url}`;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    items.push({
      name: p.title,
      url,
      section: p.title,
      path: p.title,
      parent: p.title,
      depth: 0,
      useCode: false,
    });
  }

  for (const [sectionId, sectionHeading, sectionPathPrefix] of sectionInfo) {
    const entries = typedDocs[sectionId] ?? {};
    for (const [gid, entry] of Object.entries(entries)) {
      if (gid === sectionId) continue;
      // deno-lint-ignore no-explicit-any
      const e = entry as any;
      if (!e.url) continue;
      const url = `${basePath}/developer-reference${e.url}`;
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);
      const rest = String(e.url).replace(sectionPathPrefix, "").replace(
        /\/$/,
        "",
      );
      const segments = rest.split("/").filter(Boolean);
      const name = e.title || e.key ||
        segments[segments.length - 1] || "unknown";
      items.push({
        name,
        url,
        section: sectionHeading,
        path: segments.join("."),
        parent: segments[0] || name,
        depth: Math.max(segments.length - 1, 0),
        useCode: !e.title,
      });
    }
  }

  // CLI: every documented subcommand is a searchable command name.
  for (const command of walkCommands(cliDocs)) {
    const segments = cliCommandPath(command);
    if (!segments.length) continue;
    const url = `${basePath}${cliCommandUrl(command)}`;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    const name = segments.join(" ");
    items.push({
      name,
      url,
      section: "CLI",
      path: name,
      parent: segments[0],
      depth: Math.max(segments.length - 1, 0),
      useCode: true,
    });
  }

  // Collect every property name (recursively) from a SchemaRow tree.
  // deno-lint-ignore no-explicit-any
  const collectRowNames = (rows: any[]): string[] => {
    const names: string[] = [];
    for (const row of rows ?? []) {
      if (row.name) names.push(row.name);
      if (row.children) names.push(...collectRowNames(row.children));
    }
    return names;
  };

  // API: one entry per resource (page), plus one per operation (anchor on the
  // resource page). API_BASE_PATH already includes the /documentation prefix.
  // Each operation carries a `keywords` string (HTTP method, URL path, path
  // parameter names, and any inline request-body property names — with
  // hyphens/underscores also normalized to spaces) so the filter can match on
  // e.g. "GET /sites", "site_uuid", "site dams", or a body key like "config".
  for (const resource of getApiResources()) {
    const resourceUrl = `${API_BASE_PATH}${resource.slug}/`;
    if (!seenUrls.has(resourceUrl)) {
      seenUrls.add(resourceUrl);
      items.push({
        name: resource.title,
        url: resourceUrl,
        section: "API",
        path: resource.title,
        parent: resource.title,
        depth: 0,
        useCode: false,
        // Parent-group heading is the resource title (prose), regardless of
        // whether individual items under it are keys (code) or op titles.
        parentUseCode: false,
      });
    }
    for (const op of resource.operations) {
      const opUrl = `${resourceUrl}#${op.id}`;
      if (!seenUrls.has(opUrl)) {
        seenUrls.add(opUrl);
        // HTTP method is the only extra keyword: URL path was originally in
        // keywords so users could search a fragment like "GET /dams", but that
        // also matched every operation under a resource for the resource's own
        // slug ("site" hit every /sites/... operation). Parameter and body-key
        // names are emitted below as their own filter items, so URL matching
        // is now redundant — everything worth finding has its own row.
        const keywords = op.method.toLowerCase();
        items.push({
          name: op.title,
          url: opUrl,
          section: "API",
          path: `${resource.title} / ${op.title}`,
          parent: resource.title,
          depth: 1,
          useCode: false,
          parentUseCode: false,
          keywords,
        });
      }

      // One item per parameter (path/query/header/etc.) or request-body key
      // so a filter query for a name returns the key itself (not the enclosing
      // operation title), with the operation title as secondary context.
      // Anchors are namespaced with the operation id so URLs target the exact
      // row rather than the first occurrence of that key on the page.
      const emittedKeys = new Set<string>();
      const emitKey = (name: string) => {
        if (emittedKeys.has(name)) return;
        emittedKeys.add(name);
        items.push({
          name,
          url: `${resourceUrl}#${op.id}--${name}`,
          section: "API",
          path: `${resource.title} / ${op.title}`,
          parent: resource.title,
          context: op.title,
          depth: 2,
          useCode: true,
          parentUseCode: false,
        });
      };
      for (const p of op.pathParams) emitKey(p.name);
      for (const p of op.filterParams) emitKey(p.name);
      for (const p of op.sortParams) emitKey(p.name);
      for (const p of op.paginationParams) emitKey(p.name);
      for (const p of op.queryParams) emitKey(p.name);
      for (const p of op.headerParams) emitKey(p.name);
      for (const key of collectRowNames(op.requestRows)) emitKey(key);
    }
  }

  // API schemas: one entry per named schema page, plus one per property key
  // (same pattern as API operations). Property matches display the key itself
  // with the schema name as secondary context.
  for (const schema of getApiSchemas()) {
    const url = `${API_SCHEMAS_BASE_PATH}${schema.slug}/`;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      items.push({
        name: schema.name,
        url,
        section: "API Schemas",
        path: schema.name,
        parent: schema.name,
        depth: 0,
        useCode: true,
      });
    }
    for (const key of collectRowNames(schema.rows)) {
      items.push({
        name: key,
        url: `${url}#${schema.slug}--${key}`,
        section: "API Schemas",
        path: `${schema.name} / ${key}`,
        parent: schema.name,
        context: schema.name,
        depth: 1,
        useCode: true,
      });
    }
  }

  // Editable Regions page keys are authored in MDX (not the schema data),
  // so regex-scrape <comp.OptionsRow label="..."> to add them to the filter.
  // Each row's rendered HTML has an id matching the label, so anchor links
  // jump straight to the row.
  try {
    const mdxSrc = Deno.readTextFileSync(
      "developer/reference/editable-regions/index.mdx",
    );
    const labels = [
      ...mdxSrc.matchAll(/<comp\.OptionsRow\s+label="([^"]+)"/g),
    ].map((m) => m[1]);
    for (const label of labels) {
      items.push({
        name: label,
        url: `${basePath}/developer-reference/editable-regions/#${label}`,
        section: "Editable Regions",
        path: label,
        parent: label,
        depth: 0,
        useCode: true,
      });
    }
  } catch { /* file missing — skip */ }

  // Permissions page keys come from _data/permissions.json (rendered by the
  // PermissionsTree component). Walk the nested `children` tree and surface
  // every permission key. The rendered page has an id matching each key.
  try {
    const permsSrc = Deno.readTextFileSync(
      "_data/permissions.json",
    );
    // deno-lint-ignore no-explicit-any
    const perms = JSON.parse(permsSrc) as Record<string, any>;
    const collect = (node: Record<string, unknown>) => {
      for (const [key, val] of Object.entries(node)) {
        items.push({
          name: key,
          url:
            `${basePath}/developer-reference/permissions/#${encodeURIComponent(key)}`,
          section: "Permissions",
          path: key,
          parent: key,
          depth: 0,
          useCode: true,
        });
        // deno-lint-ignore no-explicit-any
        const v = val as any;
        if (v && typeof v === "object" && v.children) {
          collect(v.children);
        }
      }
    };
    collect(perms);
  } catch { /* file missing — skip */ }

  const payload = `window.__refNavItems = ${JSON.stringify(items)};`;
  const outPath = "assets/js/reference-nav-data.js";
  // Only write if the content changed, to avoid triggering unnecessary rebuilds
  // during watch mode.
  let existing = "";
  try {
    existing = Deno.readTextFileSync(outPath);
  } catch { /* first build */ }
  if (existing !== payload) {
    Deno.writeTextFileSync(outPath, payload);
  }
}

// Caches for expensive operations (persist across incremental builds)
const renderTextOnlyCache = new Map<string, string>();
const glossaryTermCache = new Map<string, string>();
const glossaryTermNameCache = new Map<string, string>();
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

function stripHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc?.body?.textContent || "";
}

const domainsRegExp = new RegExp("cloudcannon.com|^\/|^\#");

const site = lume({
  location: new URL("https://cloudcannon.com/documentation/"),
  dest: "_site/documentation",
  server: {
    port: 9010,
    root: "../",
  },
});

// Build precompiled reference navigation
const refNavSections = [
  ...buildRefNav(
    configDocs,
    routingDocs,
    initialSiteSettingsDocs,
    veapiDocs,
  ),
  buildCliRefNav(cliDocs),
];

// API reference navigation section (generated from the OpenAPI spec)
const apiNavSection = {
  id: "type.Api",
  heading: "API",
  icon: "api",
  basePath: API_BASE_PATH,
  items: getApiResources().map((resource) => ({
    url: `${API_BASE_PATH}${resource.slug}/`,
    name: resource.title,
    gid: `api.${resource.slug}`,
  })),
};

// Schemas index (a single nav link; the index page lists every schema)
const apiSchemasNavSection = {
  id: "type.ApiSchemas",
  heading: "Schemas",
  icon: "data_object",
  basePath: API_SCHEMAS_BASE_PATH,
  items: [] as { url: string; name: string; gid: string }[],
};

site.data("ref_nav", [...refNavSections, apiNavSection, apiSchemasNavSection]);

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

site.use(icons());

const injectedSections: Promise<string>[] = [];

const mdFilter = site.renderer.helpers.get("md")?.[0];

site.ignore(
  "README.md",
  "AGENTS.md",
  "unused",
  "STYLE_GUIDE.mdx",
  "STYLE_GUIDE_AGENTS.md",
  "scripts",
  ".claude",
  "cloudcannon.config.yml",
);

// Hides "empty page" warning for each glossary item - used on combined list instead.
site.ignore((path) =>
  path.startsWith("/user/glossary/") && path.endsWith(".yml")
);

// Detect dev mode (serve command uses -s flag)
const isDevMode = Deno.args.includes("-s") || Deno.args.includes("--serve");

// In dev mode, only load recent changelogs for faster builds
if (isDevMode) {
  site.ignore(
    "changelogs/2015",
    "changelogs/2016",
    "changelogs/2017",
    "changelogs/2018",
    "changelogs/2019",
    "changelogs/2020",
    "changelogs/2021",
    "changelogs/2022",
    "changelogs/2023",
  );
  console.log("  Dev mode: Loading only recent changelogs (2024-2025)");
}

// Creates an excerpt for all changelogs saved in description.
site.preprocess([".md", ".mdx"], function processExcerpt(pages) {
  pages.forEach((page) => {
    if (
      !page.data.description && page.src.path.startsWith("/changelogs/")
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
  });
});

site.copy("ye_olde_images");
site.copy("assets/external_screenshots");
site.copy("assets/onboarding_screenshots");
site.copy("assets/diagrams");
site.copy("assets/deprecated");
site.copy("uploads", "static");
site.copy("robots.txt");

if (Deno.env.get("DOCSHOTS_LOCAL")) {
  site.copy("local-docshots");
}

// Temporary trick to disable indented code blocks if we happen to use markdown-it
// deno-lint-ignore no-explicit-any
(site.formats.get(".md")?.engines?.[0] as any)?.engine?.disable?.("code");

// Pagefind search indexing - runs automatically after each build
// Uses local plugin (_plugins/pagefind.ts) with pagefind v1.5.0
site.use(pagefind({
  outputPath: "/_pagefind", // Match templates, routing.json and postbuild
  ui: false, // Disable old PagefindUI
  componentUI: true, // Enable new Component UI (v1.5+)
}));

site.use(jsx());
site.use(mdx());
site.use(esbuild());
site.use(sass());
site.add("/assets/js/site.js");
site.add("/assets/js/reference-nav-data.js");
site.add("/assets/css/site.scss");

// Append the /documentation/ prefix to all links
site.use(basePath());

site.add("/assets/img");
// Uploads are copied via site.copy() above - don't also add them here
// site.add("/uploads");

site.use(date());
site.use(sitemap({
  query: "!url^=/404/",
}));

site.use(markdownPages());
site.use(llmsTxt());

// Changelog RSS feed - uses changelogs tag (year pages use changelog-year tag instead)
site.use(feed({
  output: ["/changelog/feed.xml"],
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

site.preprocess([".md"], (pages) => {
  for (const page of pages) {
    if (page.src?.path?.startsWith("/user/glossary/")) {
      page.data.collection = "glossary";
    }
  }
});

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
          if (next_newline) {
            let insert_before_el: ChildNode | null = next_newline;

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
          } else {
            // No newline found ahead — this marker is on the last line of the
            // code block (which has been trimmed of its trailing newline).
            // Append the badge as the last child so it lands at end-of-line.
            codeEl.appendChild(commentEl);
          }
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

const injectReusableContent = async (el: HTMLElement) => {
  const reusableContent = el.querySelectorAll<HTMLElement>(
    `:scope [data-common-content-id]`,
  );

  for (const injectionEl of reusableContent) {
    const injectionSlots: Record<string, string> = {};
    for (
      const slotContentEl of injectionEl.querySelectorAll<HTMLElement>(
        `:scope [data-common-content-slot-content]`,
      )
    ) {
      const slotName = slotContentEl.getAttribute(
        "data-common-content-slot-content",
      );
      if (!slotName) continue;

      injectionSlots[slotName] = slotContentEl.innerHTML;
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
      const slotName = slotEl.getAttribute(
        "data-common-content-slot",
      );
      if (!slotName) continue;

      if (injectionSlots[slotName]) {
        slotEl.innerHTML = injectionSlots[slotName];
      }
    }

    await injectReusableContent(injectionEl);
  }
};

site.process([".html"], async function processInjectReusableContent(pages) {
  await Promise.all(
    pages.map((page) => injectReusableContent(page.document.body)),
  );
});

site.process([".html"], function processHTMLPages(pages) {
  for (const page of pages) {
    // Bind inline `<code>` to adjacent parentheses so mobile line breaks
    // don't strand a lone `(` on one line, the code on the next, and `)`
    // below that. Insert U+2060 WORD JOINER (invisible, zero-width, forbids
    // line break at its position) in the surrounding text nodes. Skip code
    // inside <pre> blocks — those are display code and never wrap this way.
    page.document?.querySelectorAll("code").forEach((codeEl) => {
      const el = codeEl as unknown as HTMLElement & { parentElement?: unknown };
      // Skip if inside a <pre> block
      // deno-lint-ignore no-explicit-any
      let anc: any = el;
      while (anc) {
        if (anc?.tagName === "PRE") return;
        anc = anc.parentNode;
      }
      const prev = (codeEl as unknown as Node).previousSibling;
      const next = (codeEl as unknown as Node).nextSibling;
      if (prev && prev.nodeType === 3) {
        const v = prev.nodeValue || "";
        if (v.endsWith("(") && !v.endsWith("(⁠")) {
          prev.nodeValue = v + "⁠";
        }
      }
      if (next && next.nodeType === 3) {
        const v = next.nodeValue || "";
        if (v.startsWith(")") && !v.startsWith("⁠)")) {
          next.nodeValue = "⁠" + v;
        }
      }
    });

    const collisions: Record<string, boolean> = {};

    const fixIdCollisions = (slugPrefix: string): string => {
      let slug = slugPrefix;
      let count = 0;
      while (collisions[slug]) {
        count += 1;
        slug = `${slugPrefix}-${count}`;
      }

      collisions[slug] = true;
      return slug;
    };

    const appendAnchorHeader = (el: HTMLElement, slug: string): void => {
      el.setAttribute("id", slug);
      el.classList.add("c-anchor-header");
      const link = createLink(page, "#", `#${slug}`);
      link.classList.add("c-anchor-header__link");
      link.setAttribute("data-pagefind-ignore", "true");
      el.appendChild(link);
    };

    let tocContainer = page.document?.querySelectorAll(`.l-toc`)?.[0];
    const toc = page.document.createElement("ol");
    toc.classList.add("l-toc__list");

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
      continue;
    }

    page.document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (el.hasAttribute("data-skip-anchor")) return;

      const text = el.innerText || el.textContent || "";
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

    page.document.querySelectorAll<HTMLElement>(`.c-data-reference__header`)
      .forEach(
        (el) => {
          // Respect an id set upstream (e.g. by ApiSchema's namespaced ids on
          // API pages): register the existing slug with the collision tracker
          // and just add the visible anchor link + class. Elements without an
          // id fall back to slugifying the key text with auto-suffixing.
          const existingId = el.getAttribute("id");
          let slug: string;
          if (existingId) {
            collisions[existingId] = true;
            slug = existingId;
            el.classList.add("c-anchor-header");
            const link = createLink(page, "#", `#${slug}`);
            link.classList.add("c-anchor-header__link");
            link.setAttribute("data-pagefind-ignore", "true");
            el.appendChild(link);
          } else {
            const keyEl = el.querySelector<HTMLElement>(
              ".c-data-reference__key",
            );
            const text = keyEl?.innerText || keyEl?.textContent || "";
            slug = fixIdCollisions(text);
            appendAnchorHeader(el, slug);
          }
        },
      );

    if (hasItems) {
      const h3 = page.document.createElement("h3");
      h3.classList.add("l-toc__heading");
      const headingText = page.document.createTextNode("On this page");
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
  }
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
site.process([".html"], function processAnnotateCodeBlocks(pages) {
  pages.map(annotateCodeBlocks);
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

// Helper to find a doc by gid across all sections
function findDocByGid(gid: string): DocEntry | null {
  for (const section of Object.values(typedDocs)) {
    if (section && section[gid]) {
      return section[gid];
    }
  }
  return null;
}

// Helper to find a doc by gid within a specific section (derived from parent chain)
function findDocInSection(
  gid: string,
  sectionDocs: Record<string, DocEntry>,
): DocEntry | null {
  return sectionDocs[gid] || null;
}

// Derive the section from a doc entry by walking up the parent chain
function getSectionFromDoc(doc: DocEntry): Record<string, DocEntry> | null {
  // Check each section for this doc's gid
  for (const [_sectionKey, sectionDocs] of Object.entries(typedDocs)) {
    if (sectionDocs && doc.gid && sectionDocs[doc.gid]) {
      return sectionDocs;
    }
  }
  return null;
}

site.filter("get_docs_by_gid", (gid: string) => {
  return findDocByGid(gid);
});

site.filter("get_docs_by_ref", (docRef: DocEntry) => {
  const doc = findDocByGid(docRef.gid || "") || docRef;

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
  // Get the section this doc belongs to
  const sectionDocs = getSectionFromDoc(doc);

  const parentGids: string[] = [];
  let parentGid = doc.parent;
  while (parentGid) {
    parentGids.unshift(parentGid);
    const parentDoc = sectionDocs
      ? findDocInSection(parentGid, sectionDocs)
      : findDocByGid(parentGid);
    parentGid = parentDoc?.parent;
  }
  return parentGids;
});

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

  const file_content = Deno.readTextFileSync(`${file.slice(1)}`);
  // deno-lint-ignore no-explicit-any
  const yml = yamlParse(file_content) as any;
  const description = mdFilter?.(yml?.term_description) || "";
  glossaryTermCache.set(file, description);
  return description;
});

site.filter("get_glossary_term_name", (file: string) => {
  const cached = glossaryTermNameCache.get(file);
  if (cached !== undefined) {
    return cached;
  }

  const file_content = Deno.readTextFileSync(`${file.slice(1)}`);
  // deno-lint-ignore no-explicit-any
  const yml = yamlParse(file_content) as any;
  const name = yml?.glossary_term_name || "";
  glossaryTermNameCache.set(file, name);
  return name;
});

site.filter("get_index_page", (page: string) => {
  page = page.split("/")[1];
  if (page.indexOf("-") != -1) {
    try {
      const page_parts = page.split("-");
      const file_content = Deno.readTextFileSync(
        `${page_parts[0]}/${page_parts[1]}/index.mdx`,
      );
      const { attrs } = extract(file_content);
      return {
        attrs: attrs as Record<string, unknown>,
        url: `/${page_parts[0]}-${page_parts[1]}/`,
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
  const dir = "changelogs";
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
