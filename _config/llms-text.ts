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

const BASE_URL = "https://cloudcannon.com";
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/CloudCannon/platform-documentation/main";
const GITHUB_REPO_URL = "https://github.com/CloudCannon/platform-documentation";

/** Format a page with GitHub raw link and page URL */
function formatPageLink(p: DocPage, fallback = "Documentation"): string {
  const githubUrl = `${GITHUB_RAW_URL}${p.srcPath}`;
  const pageUrl = `${BASE_URL}${p.url}`;
  const desc = p.description || fallback;
  return `- [${p.title}](${githubUrl}): ${desc} ([view page](${pageUrl}))`;
}

/** Format a page as an ordered subitem (indented with number) */
function formatSubPageLink(p: DocPage, index: number, fallback = "Documentation"): string {
  const githubUrl = `${GITHUB_RAW_URL}${p.srcPath}`;
  const pageUrl = `${BASE_URL}${p.url}`;
  const desc = p.description || fallback;
  return `  ${index}. [${p.title}](${githubUrl}): ${desc} ([view page](${pageUrl}))`;
}

/** Format a guide with its children as a nested list */
function formatGuide(guide: Guide, fallback = "Guide"): string {
  const lines: string[] = [];
  lines.push(formatPageLink(guide.parent, fallback));
  
  // Sort children by order, then by title
  const sortedChildren = [...guide.children].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  });
  
  sortedChildren.forEach((child, i) => {
    lines.push(formatSubPageLink(child, i + 1, fallback));
  });
  return lines.join("\n");
}

/** Get the static Developer Reference section */
function getDeveloperReferenceSection(): string {
  return `## Developer Reference

Configuration types and schemas are available directly from these repositories:

- [configuration-types](https://github.com/CloudCannon/configuration-types): TypeScript types and JSON Schemas for CloudCannon configuration files
- [javascript-api](https://github.com/CloudCannon/javascript-api): TypeScript declarations for the CloudCannon JavaScript API

Reference documentation:
- [Developer Reference Overview](${GITHUB_RAW_URL}/developer/reference/index.mdx): Index of all reference documentation ([view page](${BASE_URL}/documentation/developer-reference/))
- [Configuration File Reference](${GITHUB_RAW_URL}/developer/reference/configuration-file/index.mdx): All keys for cloudcannon.config.* ([view page](${BASE_URL}/documentation/developer-reference/configuration-file/))
- [Initial Site Settings Reference](${GITHUB_RAW_URL}/developer/reference/initial-site-settings-file/index.mdx): Settings for .cloudcannon/initial-site-settings.json ([view page](${BASE_URL}/documentation/developer-reference/initial-site-settings-file/))
- [Routing File Reference](${GITHUB_RAW_URL}/developer/reference/routing-file/index.mdx): Redirects and headers for .cloudcannon/routing.json ([view page](${BASE_URL}/documentation/developer-reference/routing-file/))
- [Permissions Reference](${GITHUB_RAW_URL}/developer/reference/permissions/index.mdx): All available permission settings ([view page](${BASE_URL}/documentation/developer-reference/permissions/))
- [JSON Schemas](${GITHUB_RAW_URL}/developer/reference/schemas/index.mdx): Schema files for IDE autocomplete and validation ([view page](${BASE_URL}/documentation/developer-reference/schemas/))
- [TypeScript Types](${GITHUB_RAW_URL}/developer/reference/typescript/index.mdx): @cloudcannon/configuration-types package ([view page](${BASE_URL}/documentation/developer-reference/typescript/))`;
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
function generateLlmsContent(collections: Collections): string {
  const parts: string[] = [];

  // Header
  parts.push(`# CloudCannon Documentation

> CloudCannon is a Git-based Content Management System for static site generators. This documentation covers setup, configuration, editing interfaces, hosting, and all platform features.

- Source: ${GITHUB_REPO_URL}
- Website: ${BASE_URL}/documentation/`);

  // Dynamic sections
  for (const section of SECTIONS) {
    parts.push(`\n## ${section.title}\n\n${section.description}\n`);
    
    if (section.isGuide) {
      const guides = collections[section.key] as Guide[];
      parts.push(guides.map(g => formatGuide(g, section.fallback)).join("\n"));
    } else {
      const pages = collections[section.key] as DocPage[];
      parts.push(pages.map(p => formatPageLink(p, section.fallback)).join("\n"));
    }
  }

  // Developer Reference (static)
  parts.push(`\n${getDeveloperReferenceSection()}`);

  // Changelogs - show latest 3 and link to full archive
  parts.push(`\n## Changelogs

Release notes and platform updates.

### Latest Updates
`);
  parts.push(collections.latestChangelogs.map(p => formatPageLink(p, "Release notes")).join("\n"));
  parts.push(`\n- [All changelogs](${GITHUB_REPO_URL}/tree/main/changelogs): Full archive organized by year ([view page](${BASE_URL}/documentation/changelog/))`);

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

      // Generate llms.txt
      const llmsTxt = generateLlmsContent(collections);

      // Write file to output
      const outputPath = site.options.dest;
      Deno.writeTextFileSync(`${outputPath}/llms.txt`, llmsTxt);

      // Add llms.txt to sitemap
      const sitemapPath = `${outputPath}/sitemap.xml`;
      try {
        let sitemapContent = Deno.readTextFileSync(sitemapPath);
        const llmsEntry = `  <url>
    <loc>${BASE_URL}/documentation/llms.txt</loc>
  </url>
</urlset>`;
        sitemapContent = sitemapContent.replace("</urlset>", llmsEntry);
        Deno.writeTextFileSync(sitemapPath, sitemapContent);
        console.log(`Added llms.txt to sitemap.xml`);
      } catch (e) {
        console.warn(`Could not update sitemap.xml: ${e}`);
      }

      console.log(`Generated llms.txt (${(llmsTxt.length / 1024).toFixed(1)} KB)`);
    });
  };
}
