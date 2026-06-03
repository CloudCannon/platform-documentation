import { renderMermaid } from "./utils/renderMermaid.ts";

interface MermaidProps {
  name: string;
  chart: string;
  alt: string;
  caption?: string;
}

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export default function Mermaid({ name, chart, alt, caption }: MermaidProps) {
  if (!alt) {
    throw new Error("Mermaid: `alt` is required (a11y, no-JS, Pagefind).");
  }
  if (!name) {
    throw new Error(
      "Mermaid: `name` is required — used as the cached SVG filename so reviewers can identify the diagram. Use kebab-case, e.g. name=\"publishing-workflow\".",
    );
  }
  if (!NAME_PATTERN.test(name)) {
    throw new Error(
      `Mermaid: invalid name "${name}". Use lowercase kebab-case (letters, digits, hyphens; must start with a letter or digit).`,
    );
  }

  const { light, dark } = renderMermaid(name, chart);

  return (
    <figure className="c-mermaid" role="img" aria-label={alt}>
      <div
        className="c-mermaid__svg c-mermaid__svg--light"
        dangerouslySetInnerHTML={{ __html: light }}
      />
      <div
        className="c-mermaid__svg c-mermaid__svg--dark"
        dangerouslySetInnerHTML={{ __html: dark }}
      />
      {caption && <figcaption className="c-mermaid__caption">{caption}</figcaption>}
    </figure>
  );
}

export function toMarkdown({ alt, caption }: MermaidProps): string {
  return `_[Diagram: ${caption || alt}]_\n\n`;
}
