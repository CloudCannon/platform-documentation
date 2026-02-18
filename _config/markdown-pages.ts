/**
 * Lume plugin to generate clean markdown versions of each documentation page.
 *
 * Parses raw MDX source files using remark + remark-mdx, walks the AST,
 * and calls each component's co-located toMarkdown() export for JSX nodes.
 * Writes .md files alongside the HTML output in _site/.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkFrontmatter from "remark-frontmatter";
import { join, dirname } from "@std/path";
import { ensureDir } from "@std/fs";

type ToMarkdownFn = (
  props: Record<string, unknown>,
  childrenMd: string,
  helpers?: Record<string, unknown>,
) => string;

// deno-lint-ignore no-explicit-any
type MdastNode = any;

const parser = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkFrontmatter, ["yaml"]);

async function buildComponentRegistry(
  componentsDir: string,
  baseUrl: string,
): Promise<Record<string, ToMarkdownFn>> {
  const registry: Record<string, ToMarkdownFn> = {};

  for await (const entry of Deno.readDir(componentsDir)) {
    if (!entry.name.endsWith(".tsx") || entry.isDirectory) continue;
    const name = entry.name.replace(".tsx", "");
    try {
      const modUrl = new URL(
        `../_components/${entry.name}`,
        baseUrl,
      ).href;
      const mod = await import(modUrl);
      if (typeof mod.toMarkdown === "function") {
        registry[name] = mod.toMarkdown;
      }
    } catch (err) {
      console.warn(`Could not import toMarkdown from ${entry.name}:`, err);
    }
  }

  return registry;
}

function evaluateExpression(
  expr: string,
  pageData: Record<string, unknown>,
): unknown {
  const trimmed = expr.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);
  try {
    return JSON.parse(trimmed);
  } catch { /* not JSON */ }
  if (trimmed in pageData) return pageData[trimmed];
  return undefined;
}

function extractProps(
  attributes: MdastNode[],
  pageData: Record<string, unknown>,
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const attr of attributes || []) {
    if (attr.type === "mdxJsxAttribute") {
      const name: string = attr.name;
      if (attr.value === null || attr.value === undefined) {
        props[name] = true;
      } else if (typeof attr.value === "string") {
        props[name] = attr.value;
      } else if (attr.value?.type === "mdxJsxAttributeValueExpression") {
        props[name] = evaluateExpression(attr.value.value, pageData);
      }
    }
  }
  return props;
}

function serializeChildren(
  node: MdastNode,
  registry: Record<string, ToMarkdownFn>,
  pageData: Record<string, unknown>,
): string {
  if (!node.children) return "";
  return node.children
    .map((c: MdastNode) => serializeNode(c, registry, pageData))
    .join("");
}

/**
 * Handle standard HTML elements that appear as mdxJsx* nodes in the AST.
 * These are plain HTML tags (a, p, strong, em, code, br, etc.) written
 * directly in MDX source rather than via comp.* components.
 */
function serializeHtmlJsx(
  tag: string,
  node: MdastNode,
  registry: Record<string, ToMarkdownFn>,
  pageData: Record<string, unknown>,
): string {
  const inner = () => serializeChildren(node, registry, pageData);
  switch (tag) {
    case "": return inner();
    case "p": return `${inner().trim()}\n\n`;
    case "strong":
    case "b": {
      const t = inner().trim();
      return t ? `**${t}**` : "";
    }
    case "em":
    case "i": {
      const t = inner().trim();
      return t ? `*${t}*` : "";
    }
    case "code": {
      const t = inner();
      return t ? `\`${t}\`` : "";
    }
    case "a": {
      const href = node.attributes?.find(
        (a: MdastNode) => a.name === "href",
      )?.value || "";
      const text = inner().trim();
      if (!text) return "";
      return href && !href.startsWith("#") ? `[${text}](${href})` : text;
    }
    case "br": return "\n";
    case "hr": return "\n---\n\n";
    case "h1": return `\n# ${inner().trim()}\n\n`;
    case "h2": return `\n## ${inner().trim()}\n\n`;
    case "h3": return `\n### ${inner().trim()}\n\n`;
    case "h4": return `\n#### ${inner().trim()}\n\n`;
    case "h5":
    case "h6": return `\n##### ${inner().trim()}\n\n`;
    case "ul": {
      const items = (node.children || []).map((li: MdastNode) => {
        const content = serializeNode(li, registry, pageData).trim();
        return `- ${content}`;
      });
      return items.join("\n") + "\n\n";
    }
    case "ol": {
      const items = (node.children || []).map(
        (li: MdastNode, i: number) => {
          const content = serializeNode(li, registry, pageData).trim();
          return `${i + 1}. ${content}`;
        },
      );
      return items.join("\n") + "\n\n";
    }
    case "li": return inner();
    case "blockquote": {
      const content = inner().trim();
      return content.split("\n").map((l: string) => `> ${l}`).join("\n") + "\n\n";
    }
    case "pre": {
      const codeChild = (node.children || []).find(
        (c: MdastNode) => c.name === "code" || c.type === "code",
      );
      if (codeChild) {
        const lang = codeChild.attributes?.find(
          (a: MdastNode) => a.name === "className",
        )?.value?.replace("language-", "") || "";
        return `\`\`\`${lang}\n${serializeChildren(codeChild, registry, pageData).trim()}\n\`\`\`\n\n`;
      }
      return `\`\`\`\n${inner().trim()}\n\`\`\`\n\n`;
    }
    case "img": {
      const alt = node.attributes?.find(
        (a: MdastNode) => a.name === "alt",
      )?.value || "";
      const src = node.attributes?.find(
        (a: MdastNode) => a.name === "src",
      )?.value || "";
      return `![${alt}](${src})\n\n`;
    }
    case "del": {
      const t = inner().trim();
      return t ? `~~${t}~~` : "";
    }
    case "script":
    case "style":
    case "svg":
    case "video":
    case "iframe":
      return "";
    default:
      return inner();
  }
}

function serializeNode(
  node: MdastNode,
  registry: Record<string, ToMarkdownFn>,
  pageData: Record<string, unknown>,
): string {
  switch (node.type) {
    case "root":
      return serializeChildren(node, registry, pageData);

    case "yaml":
      return "";

    case "heading": {
      const prefix = "#".repeat(node.depth);
      const text = serializeChildren(node, registry, pageData);
      return `\n${prefix} ${text.trim()}\n\n`;
    }

    case "paragraph": {
      const text = serializeChildren(node, registry, pageData);
      return `${text.trim()}\n\n`;
    }

    case "text":
      return node.value;

    case "strong": {
      const inner = serializeChildren(node, registry, pageData);
      return inner ? `**${inner}**` : "";
    }

    case "emphasis": {
      const inner = serializeChildren(node, registry, pageData);
      return inner ? `*${inner}*` : "";
    }

    case "delete": {
      const inner = serializeChildren(node, registry, pageData);
      return inner ? `~~${inner}~~` : "";
    }

    case "inlineCode":
      return `\`${node.value}\``;

    case "code":
      return `\`\`\`${node.lang || ""}\n${node.value}\n\`\`\`\n\n`;

    case "link": {
      const text = serializeChildren(node, registry, pageData);
      return `[${text}](${node.url})`;
    }

    case "image":
      return `![${node.alt || ""}](${node.url})\n\n`;

    case "list": {
      const items = node.children.map((item: MdastNode, i: number) => {
        const prefix = node.ordered
          ? `${(node.start || 1) + i}. `
          : "- ";
        const content = serializeNode(item, registry, pageData);
        const indented = content
          .trim()
          .split("\n")
          .map((line: string, li: number) =>
            li === 0 ? line : `  ${line}`
          )
          .join("\n");
        return `${prefix}${indented}`;
      });
      return items.join("\n") + "\n\n";
    }

    case "listItem":
      return serializeChildren(node, registry, pageData);

    case "blockquote": {
      const content = serializeChildren(node, registry, pageData);
      return (
        content
          .trim()
          .split("\n")
          .map((l: string) => `> ${l}`)
          .join("\n") + "\n\n"
      );
    }

    case "thematicBreak":
      return "---\n\n";

    case "table": {
      const rows = node.children.map((row: MdastNode) =>
        row.children.map((cell: MdastNode) =>
          serializeChildren(cell, registry, pageData).trim()
        )
      );
      if (rows.length === 0) return "";
      const maxCols = Math.max(...rows.map((r: string[]) => r.length));
      const lines: string[] = [];
      lines.push(`| ${rows[0].join(" | ")} |`);
      lines.push(
        `| ${Array.from({ length: maxCols }, () => "---").join(" | ")} |`,
      );
      for (let i = 1; i < rows.length; i++) {
        lines.push(`| ${rows[i].join(" | ")} |`);
      }
      return lines.join("\n") + "\n\n";
    }

    case "tableRow":
    case "tableCell":
      return serializeChildren(node, registry, pageData);

    case "html":
      return node.value + "\n";

    case "break":
      return "\n";

    case "mdxJsxFlowElement":
    case "mdxJsxTextElement": {
      const rawName = node.name || "";

      // Standard HTML elements appear as JSX nodes in MDX AST
      if (!rawName.startsWith("comp.")) {
        return serializeHtmlJsx(rawName, node, registry, pageData);
      }

      const compName = rawName.replace("comp.", "");
      const renderer = registry[compName];
      if (!renderer) {
        console.warn(`markdown-pages: no toMarkdown for comp.${compName}`);
        return serializeChildren(node, registry, pageData);
      }

      const explicitProps = extractProps(node.attributes, pageData);
      const mergedProps = { ...pageData, ...explicitProps };
      const childrenMd = serializeChildren(node, registry, pageData);
      try {
        return renderer(mergedProps, childrenMd);
      } catch (err) {
        console.warn(
          `markdown-pages: toMarkdown failed for comp.${compName}:`,
          err,
        );
        return childrenMd;
      }
    }

    case "mdxFlowExpression":
    case "mdxTextExpression":
      return "";

    case "definition":
      return "";

    default:
      if (node.children) {
        return serializeChildren(node, registry, pageData);
      }
      return node.value || "";
  }
}

function deriveCollection(url: string): string {
  if (url.includes("/changelog/")) return "changelog";
  if (url.includes("/user-")) return "user";
  return "developer";
}

function escapeFrontmatter(value: string): string {
  if (
    value.includes(":") ||
    value.includes("\n") ||
    value.includes('"') ||
    value.includes("#")
  ) {
    return `"${value.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }
  return value;
}

export default function markdownPages() {
  return (site: Lume.Site) => {
    site.addEventListener("afterBuild", async () => {
      const componentsDir = join(site.options.src, "_components");
      const registry = await buildComponentRegistry(
        componentsDir,
        import.meta.url,
      );
      console.log(
        `markdown-pages: loaded ${Object.keys(registry).length} component renderers`,
      );

      const outputDir = site.options.dest;
      let written = 0;
      let noSource = 0;
      let noTitle = 0;

      for (const page of site.pages) {
        const url = page.data.url as string;
        if (!url) continue;

        const isDoc =
          url.includes("/documentation/user-") ||
          url.includes("/documentation/developer-") ||
          url.includes("/documentation/changelog/") ||
          url.includes("/documentation/guides/");
        if (!isDoc) continue;
        if (url === "/documentation/changelog/") continue;
        if (page.data.published === false) continue;

        const srcPath = page.src.path + (page.src.ext || ".mdx");
        const fullSrcPath = join(site.options.src, srcPath);

        let raw: string;
        try {
          raw = await Deno.readTextFile(fullSrcPath);
        } catch {
          noSource++;
          continue;
        }

        const details = page.data.details as
          | Record<string, unknown>
          | undefined;
        const title = (details?.title || page.data.title || "") as string;
        const description = (details?.description ||
          page.data.description ||
          "") as string;

        if (!title && !url.includes("/changelog/")) {
          noTitle++;
          continue;
        }

        const collection = deriveCollection(url);
        const date = page.data.date
          ? new Date(page.data.date as string | Date).toISOString().split("T")[0]
          : undefined;

        let tree: MdastNode;
        try {
          tree = parser.parse(raw);
        } catch (err) {
          console.warn(`markdown-pages: parse failed for ${srcPath}:`, err);
          skipped++;
          continue;
        }

        const pageData = (page.data || {}) as Record<string, unknown>;
        const body = serializeNode(tree, registry, pageData)
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        const fm: string[] = ["---"];
        fm.push(`title: ${escapeFrontmatter(title)}`);
        if (description) fm.push(`description: ${escapeFrontmatter(description)}`);
        fm.push(`url: ${url}`);
        fm.push(`collection: ${collection}`);
        if (date) fm.push(`date: ${date}`);
        fm.push("---");

        const mdContent = fm.join("\n") + "\n\n" + body + "\n";

        let outPath: string;
        if (url.endsWith("/")) {
          outPath = join(outputDir, url, "index.md");
        } else {
          outPath = join(outputDir, url + ".md");
        }

        await ensureDir(dirname(outPath));
        await Deno.writeTextFile(outPath, mdContent);
        written++;
      }

      const total = written + noSource + noTitle;
      console.log(
        `markdown-pages: wrote ${written} .md files (of ${total} doc pages, ${noSource} no source file, ${noTitle} no title)`,
      );
    });
  };
}
