import { renderMermaid } from "./utils/renderMermaid.ts";

interface MermaidProps {
  chart: string;
  alt: string;
  caption?: string;
}

export default function Mermaid({ chart, alt, caption }: MermaidProps) {
  if (!alt) {
    throw new Error("Mermaid: `alt` is required (a11y, no-JS, Pagefind).");
  }

  const { light, dark } = renderMermaid(chart);

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
