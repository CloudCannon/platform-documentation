/**
 * Lume plugin to generate llms.txt file
 * Following the llms.txt specification: https://llmstxt.org/
 */

interface DocPage {
  title: string;
  description: string;
  url: string;
  srcPath: string;
  collection: string;
  date?: Date;
  order?: number;
}

interface Guide {
  parent: DocPage;
  children: DocPage[];
}

const GITHUB_REPO_URL = "https://github.com/CloudCannon/platform-documentation";

// `baseUrl` (e.g. "https://cloudcannon.com/documentation") is resolved at build
// time from site.options.location so absolute links here match the /documentation
// base path applied by the basePath() plugin. `page.data.url` is unprefixed in the
// basePath model, so we must add the base ourselves when building absolute URLs.

/** Build the URL to the built .md file for a page */
function mdUrl(baseUrl: string, p: DocPage): string {
  return `${baseUrl}${p.url}${p.url.endsWith("/") ? "index.md" : ".md"}`;
}

/** Format a page with a link to its built .md file and page URL */
function formatPageLink(baseUrl: string, p: DocPage, fallback = "Documentation"): string {
  const pageUrl = `${baseUrl}${p.url}`;
  const desc = p.description || fallback;
  return `- [${p.title}](${mdUrl(baseUrl, p)}): ${desc} ([view page](${pageUrl}))`;
}

/** Format a page as an ordered subitem (indented with number) */
function formatSubPageLink(baseUrl: string, p: DocPage, index: number, fallback = "Documentation"): string {
  const pageUrl = `${baseUrl}${p.url}`;
  const desc = p.description || fallback;
  return `  ${index}. [${p.title}](${mdUrl(baseUrl, p)}): ${desc} ([view page](${pageUrl}))`;
}

/** Format a guide with its children as a nested list */
function formatGuide(baseUrl: string, guide: Guide, fallback = "Guide"): string {
  const lines: string[] = [];
  lines.push(formatPageLink(baseUrl, guide.parent, fallback));
  
  // Sort children by order, then by title
  const sortedChildren = [...guide.children].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  });
  
  sortedChildren.forEach((child, i) => {
    lines.push(formatSubPageLink(baseUrl, child, i + 1, fallback));
  });
  return lines.join("\n");
}

/** Get the static Developer Reference section */
function getDeveloperReferenceSection(baseUrl: string): string {
  const refBase = `${baseUrl}/developer-reference`;
  const schemaBase = "https://github.com/CloudCannon/configuration-types/releases/latest/download";
  return `## Developer Reference

Configuration types and schemas are available directly from these repositories:

- [configuration-types](https://github.com/CloudCannon/configuration-types): TypeScript types and JSON Schemas for CloudCannon configuration files
- [javascript-api](https://github.com/CloudCannon/javascript-api): TypeScript declarations for the CloudCannon JavaScript API

JSON Schemas (with full descriptions, for use by LLMs and IDEs):
- [Configuration JSON Schema](${schemaBase}/cloudcannon-config.documentation.schema.json): Full JSON Schema with descriptions for cloudcannon.config.*
- [Routing JSON Schema](${schemaBase}/cloudcannon-routing.documentation.schema.json): JSON Schema for .cloudcannon/routing.json
- [Initial Site Settings JSON Schema](${schemaBase}/cloudcannon-initial-site-settings.documentation.schema.json): JSON Schema for .cloudcannon/initial-site-settings.json

Reference documentation is organized into two parts: Site configuration (files you add to your repository) and Platform (tools and controls for the CloudCannon backend).

- [Developer Reference Overview](${refBase}/index.md): Index of all reference documentation ([view page](${refBase}/))

Site configuration:
- [Site Configuration Overview](${refBase}/site-configuration/index.md): Files you add to your repository to configure CloudCannon ([view page](${refBase}/site-configuration/))
- [Configuration File Reference](${refBase}/configuration-file/index.md): All keys for cloudcannon.config.* ([view page](${refBase}/configuration-file/))
- [Initial Site Settings Reference](${refBase}/initial-site-settings-file/index.md): Settings for .cloudcannon/initial-site-settings.json ([view page](${refBase}/initial-site-settings-file/))
- [Routing File Reference](${refBase}/routing-file/index.md): Redirects and headers for .cloudcannon/routing.json ([view page](${refBase}/routing-file/))
- [Editable Regions Reference](${refBase}/editable-regions/index.md): Mark parts of your built HTML as editable ([view page](${refBase}/editable-regions/))
- [Visual Editor API Reference](${refBase}/visual-editor-api/index.md): Connect your front end to the visual editor ([view page](${refBase}/visual-editor-api/))
- [JSON Schemas](${refBase}/schemas/index.md): Schema files for IDE autocomplete and validation ([view page](${refBase}/schemas/))
- [TypeScript Types](${refBase}/typescript/index.md): @cloudcannon/configuration-types package ([view page](${refBase}/typescript/))

Platform:
- [Platform Overview](${refBase}/platform/index.md): Tools and controls for working with the CloudCannon backend ([view page](${refBase}/platform/))
- [CLI Reference](${refBase}/cli/index.md): Manage CloudCannon from the terminal ([view page](${refBase}/cli/))
- [SDK Reference](${refBase}/sdk/index.md): Typed client for the CloudCannon API ([view page](${refBase}/sdk/))
- [API Reference](${refBase}/api/index.md): Manage organizations, projects, sites, and builds over HTTP ([view page](${refBase}/api/))
- [OpenAPI specification](https://app.cloudcannon.com/api/v0/openapi.json): Machine-readable definition of every API endpoint, parameter, and response (for use by agents, code generation, and API tools)
- [Permissions Reference](${refBase}/permissions/index.md): All available permission settings ([view page](${refBase}/permissions/))`;
}

interface Collections {
  userGuides: Guide[];
  developerGuides: Guide[];
  userArticles: DocPage[];
  developerArticles: DocPage[];
  latestChangelogs: DocPage[];
}

interface SectionDef {
  key: keyof Collections;
  title: string;
  description: string;
  fallback: string;
  isGuide: boolean;
}

const SECTIONS: SectionDef[] = [
  { key: "userGuides", title: "User Guides", description: "Step-by-step tutorials for content editors and site managers.", fallback: "Guide", isGuide: true },
  { key: "developerGuides", title: "Developer Guides", description: "Step-by-step tutorials for developers integrating with CloudCannon.", fallback: "Guide", isGuide: true },
  { key: "userArticles", title: "User Articles", description: "Documentation for editors and content managers.", fallback: "Documentation", isGuide: false },
  { key: "developerArticles", title: "Developer Articles", description: "Technical documentation for developers.", fallback: "Documentation", isGuide: false },
];

/** Generate llms.txt content with GitHub links */
function generateLlmsContent(collections: Collections, baseUrl: string): string {
  const parts: string[] = [];

  // Header
  parts.push(`# CloudCannon Documentation

> CloudCannon is a Git-based Content Management System for static site generators. This documentation covers setup, configuration, editing interfaces, hosting, and all platform features.

- Source: ${GITHUB_REPO_URL}
- Website: ${baseUrl}/`);

  // Dynamic sections
  for (const section of SECTIONS) {
    parts.push(`\n## ${section.title}\n\n${section.description}\n`);
    
    if (section.isGuide) {
      const guides = collections[section.key] as Guide[];
      parts.push(guides.map(g => formatGuide(baseUrl, g, section.fallback)).join("\n"));
    } else {
      const pages = collections[section.key] as DocPage[];
      parts.push(pages.map(p => formatPageLink(baseUrl, p, section.fallback)).join("\n"));
    }
  }

  // Developer Reference (static)
  parts.push(`\n${getDeveloperReferenceSection(baseUrl)}`);

  // Changelogs - show latest 3 and link to full archive
  parts.push(`\n## Changelogs

Release notes and platform updates.

### Latest Updates
`);
  parts.push(collections.latestChangelogs.map(p => formatPageLink(baseUrl, p, "Release notes")).join("\n"));
  parts.push(`\n- [All changelogs](${GITHUB_REPO_URL}/tree/main/changelogs): Full archive organized by year ([view page](${baseUrl}/changelog/))`);

  return parts.join("\n");
}

/** Group guide pages into parent guides with children */
function groupGuidePages(pages: DocPage[]): Guide[] {
  const guideMap = new Map<string, Guide>();
  
  // First pass: identify parent guides (index pages)
  for (const page of pages) {
    if (page.srcPath.endsWith("/index.mdx")) {
      // This is a guide parent - use its URL as the key
      guideMap.set(page.url, { parent: page, children: [] });
    }
  }
  
  // Second pass: assign children to their parents
  for (const page of pages) {
    if (page.srcPath.endsWith("/index.mdx")) continue; // Skip parents
    
    // Find the parent URL by removing the last segment
    // e.g., /documentation/developer-guides/bookshop-astro-guide/getting-set-up/ 
    //    -> /documentation/developer-guides/bookshop-astro-guide/
    const urlParts = page.url.split("/").filter(Boolean);
    urlParts.pop(); // Remove last segment
    const parentUrl = "/" + urlParts.join("/") + "/";
    
    const guide = guideMap.get(parentUrl);
    if (guide) {
      guide.children.push(page);
    }
  }
  
  // Sort guides by parent title
  const guides = Array.from(guideMap.values());
  guides.sort((a, b) => a.parent.title.localeCompare(b.parent.title));
  
  return guides;
}

export default function llmsTxt() {
  return (site: Lume.Site) => {
    site.addEventListener("afterBuild", () => {
      const pages = site.pages;
      const docPages: DocPage[] = [];
      const changelogPages: DocPage[] = [];

      // Collect all documentation pages
      for (const page of pages) {
        const url = page.data.url as string;
        if (!url) continue;

        // Collect changelog pages
        if (url.includes("/changelog/") && url !== "/changelog/") {
          const title = (page.data.title || "") as string;
          if (!title) continue;
          
          const srcPath = page.src.path + page.src.ext;
          changelogPages.push({
            title,
            description: "",
            url,
            srcPath,
            collection: "changelog",
            date: page.data.date as Date | undefined,
          });
          continue;
        }

        let collection = "";
        if (url.includes("/user-articles/")) {
          collection = "user-articles";
        } else if (url.includes("/developer-articles/")) {
          collection = "developer-articles";
        } else if (url.includes("/user-guides/")) {
          collection = "user-guides";
        } else if (url.includes("/developer-guides/")) {
          collection = "developer-guides";
        } else {
          continue; // Skip non-documentation pages
        }

        // Skip unpublished pages
        if (page.data.published === false) continue;

        // Handle nested frontmatter structure (details.title, details.description, details.order)
        const details = page.data.details as Record<string, unknown> | undefined;
        const title = (details?.title || page.data.title || page.data.nav_title || "") as string;
        const description = (details?.description || page.data.description || "") as string;
        const order = (details?.order || page.data.order) as number | undefined;

        if (!title) continue;

        // Get source path for GitHub URL (e.g., "/user/articles/foo.mdx")
        const srcPath = page.src.path + page.src.ext;

        docPages.push({
          title,
          description,
          url,
          srcPath,
          collection,
          date: page.data.date as Date | undefined,
          order,
        });
      }

      // Sort article pages by title
      const articlePages = docPages.filter(p => 
        p.collection === "user-articles" || p.collection === "developer-articles"
      );
      articlePages.sort((a, b) => a.title.localeCompare(b.title));

      // Group guide pages into hierarchical structures
      const userGuidePages = docPages.filter(p => p.collection === "user-guides");
      const developerGuidePages = docPages.filter(p => p.collection === "developer-guides");
      
      const userGuides = groupGuidePages(userGuidePages);
      const developerGuides = groupGuidePages(developerGuidePages);

      // Sort changelogs by date (newest first) and take top 3
      changelogPages.sort((a, b) => {
        const dateA = a.date?.getTime() ?? 0;
        const dateB = b.date?.getTime() ?? 0;
        return dateB - dateA;
      });
      const latestChangelogs = changelogPages.slice(0, 3);

      // Group by collection
      const collections: Collections = {
        userGuides,
        developerGuides,
        userArticles: articlePages.filter(p => p.collection === "user-articles"),
        developerArticles: articlePages.filter(p => p.collection === "developer-articles"),
        latestChangelogs,
      };

      // Resolve the absolute site base (incl. the /documentation base path) from
      // the location config, via site.url, so links match the basePath() output.
      const baseUrl = site.url("/", true).replace(/\/$/, "");

      // Generate llms.txt
      const llmsTxt = generateLlmsContent(collections, baseUrl);

      // Write file to output
      const outputPath = site.options.dest;
      Deno.writeTextFileSync(`${outputPath}/llms.txt`, llmsTxt);

      // Generate llms-full.txt: concatenate all page markdown content
      const allDocPages = [
        ...collections.userArticles,
        ...collections.developerArticles,
        ...collections.latestChangelogs,
      ];
      for (const guide of [...collections.userGuides, ...collections.developerGuides]) {
        allDocPages.push(guide.parent);
        allDocPages.push(...guide.children);
      }

      const fullParts: string[] = [
        `# CloudCannon Documentation (Full)\n`,
        `> Complete documentation content. See llms.txt for a structured index.\n`,
      ];

      for (const p of allDocPages) {
        const mdPath = `${outputPath}${p.url}${p.url.endsWith("/") ? "index.md" : ".md"}`;
        try {
          const content = Deno.readTextFileSync(mdPath);
          fullParts.push(`\n---\n\n${content}`);
        } catch {
          // .md file not yet generated or page skipped
        }
      }

      const llmsFullTxt = fullParts.join("\n");
      Deno.writeTextFileSync(`${outputPath}/llms-full.txt`, llmsFullTxt);

      // Add llms.txt and llms-full.txt to sitemap
      const sitemapPath = `${outputPath}/sitemap.xml`;
      try {
        let sitemapContent = Deno.readTextFileSync(sitemapPath);
        const llmsEntries = `  <url>
    <loc>${baseUrl}/llms.txt</loc>
  </url>
  <url>
    <loc>${baseUrl}/llms-full.txt</loc>
  </url>
</urlset>`;
        sitemapContent = sitemapContent.replace("</urlset>", llmsEntries);
        Deno.writeTextFileSync(sitemapPath, sitemapContent);
        console.log(`Added llms.txt and llms-full.txt to sitemap.xml`);
      } catch (e) {
        console.warn(`Could not update sitemap.xml: ${e}`);
      }

      console.log(`Generated llms.txt (${(llmsTxt.length / 1024).toFixed(1)} KB)`);
      console.log(`Generated llms-full.txt (${(llmsFullTxt.length / 1024).toFixed(1)} KB)`);
    });
  };
}
