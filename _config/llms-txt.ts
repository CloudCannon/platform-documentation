/**
 * Lume plugin to generate llms.txt and llms-full.txt files
 * Following the llms.txt specification: https://llmstxt.org/
 */

import { Page, Site } from "lume/core.ts";

interface DocPage {
  title: string;
  description: string;
  url: string;
  content: string;
  collection: string;
  order?: number;
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMarkdownContent(content: string): string {
  // Remove JSX/component tags but keep their text content
  let markdown = content
    .replace(/<comp\.[^>]*>/g, '')
    .replace(/<\/comp\.[^>]*>/g, '')
    .replace(/<comp\s[^>]*\/>/g, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return markdown;
}

export default function llmsTxt() {
  return (site: Site) => {
    site.addEventListener("afterBuild", () => {
      const pages = site.pages;
      const docPages: DocPage[] = [];

      // Collect all documentation pages
      for (const page of pages) {
        const url = page.data.url as string;
        if (!url) continue;

        // Determine collection type
        let collection = "";
        if (url.includes("/documentation/articles/")) {
          collection = "articles";
        } else if (url.includes("/documentation/guides/")) {
          collection = "guides";
        } else if (url.includes("/documentation/changelogs/")) {
          collection = "changelogs";
        } else {
          continue; // Skip non-documentation pages
        }

        // Skip unpublished pages
        if (page.data.published === false) continue;

        const title = (page.data.title || page.data.nav_title || "") as string;
        const description = (page.data.description || "") as string;
        const rawContent = (page.data.content || "") as string;

        if (!title) continue;

        docPages.push({
          title,
          description,
          url,
          content: extractMarkdownContent(rawContent),
          collection,
          order: page.data.order as number | undefined,
        });
      }

      // Sort pages by collection, then by title
      docPages.sort((a, b) => {
        const collectionOrder = { guides: 0, articles: 1, changelogs: 2 };
        const aOrder = collectionOrder[a.collection as keyof typeof collectionOrder] ?? 99;
        const bOrder = collectionOrder[b.collection as keyof typeof collectionOrder] ?? 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.title.localeCompare(b.title);
      });

      // Group by collection
      const guides = docPages.filter(p => p.collection === "guides");
      const articles = docPages.filter(p => p.collection === "articles");
      const changelogs = docPages.filter(p => p.collection === "changelogs");

      // Generate llms.txt (summary with links)
      const llmsTxt = generateLlmsTxt(guides, articles, changelogs);

      // Generate llms-full.txt (full content)
      const llmsFullTxt = generateLlmsFullTxt(guides, articles, changelogs);

      // Write files to output
      const outputPath = site.options.dest;

      Deno.writeTextFileSync(`${outputPath}/documentation/llms.txt`, llmsTxt);
      Deno.writeTextFileSync(`${outputPath}/documentation/llms-full.txt`, llmsFullTxt);

      console.log(`Generated llms.txt (${(llmsTxt.length / 1024).toFixed(1)} KB)`);
      console.log(`Generated llms-full.txt (${(llmsFullTxt.length / 1024).toFixed(1)} KB)`);
    });
  };
}

function generateLlmsTxt(guides: DocPage[], articles: DocPage[], changelogs: DocPage[]): string {
  const baseUrl = "https://cloudcannon.com";

  let content = `# CloudCannon Documentation

> CloudCannon is a Git-based Content Management System for static site generators. This documentation covers setup, configuration, editing interfaces, hosting, and all platform features.

## Guides

Step-by-step tutorials for common tasks and workflows.

${guides.map(p => `- [${p.title}](${baseUrl}${p.url}): ${p.description || 'Guide'}`).join('\n')}

## Articles

Detailed documentation for all CloudCannon features.

${articles.map(p => `- [${p.title}](${baseUrl}${p.url}): ${p.description || 'Documentation'}`).join('\n')}

## Changelogs

Release notes and platform updates.

${changelogs.slice(0, 50).map(p => `- [${p.title}](${baseUrl}${p.url})`).join('\n')}

${changelogs.length > 50 ? `\n... and ${changelogs.length - 50} more changelogs` : ''}

## Optional

- [Full Documentation](${baseUrl}/documentation/llms-full.txt): Complete documentation content for comprehensive context
`;

  return content;
}

function generateLlmsFullTxt(guides: DocPage[], articles: DocPage[], changelogs: DocPage[]): string {
  const baseUrl = "https://cloudcannon.com";

  let content = `# CloudCannon Documentation (Full)

> This file contains the complete CloudCannon documentation for LLM context.
> Source: ${baseUrl}/documentation/

---

# Guides

${guides.map(p => `## ${p.title}

${p.description ? `> ${p.description}\n` : ''}
URL: ${baseUrl}${p.url}

${p.content}

---
`).join('\n')}

# Articles

${articles.map(p => `## ${p.title}

${p.description ? `> ${p.description}\n` : ''}
URL: ${baseUrl}${p.url}

${p.content}

---
`).join('\n')}

# Changelogs

${changelogs.map(p => `## ${p.title}

URL: ${baseUrl}${p.url}

${p.content}

---
`).join('\n')}
`;

  return content;
}