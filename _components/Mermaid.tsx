interface MermaidProps {
  chart: string;
  alt: string;
  caption?: string;
}

export default function Mermaid({ chart, alt, caption }: MermaidProps) {
  if (!alt) {
    throw new Error("Mermaid: `alt` is required (a11y, no-JS, Pagefind).");
  }
  if (!chart || !chart.trim()) {
    throw new Error("Mermaid: `chart` is required.");
  }

  return (
    <figure className="c-mermaid" role="img" aria-label={alt}>
      <div className="c-mermaid__loader" aria-hidden="true">
        <span className="c-mermaid__spinner" />
        <span className="c-mermaid__loader-text">Rendering diagram…</span>
      </div>
      <pre className="mermaid">{chart.trim()}</pre>
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html:
              ".c-mermaid__loader,.c-mermaid > pre.mermaid{display:none}.c-mermaid__noscript{display:block}",
          }}
        />
        <div className="c-mermaid__noscript">{alt}</div>
      </noscript>
      {caption && <figcaption className="c-mermaid__caption">{caption}</figcaption>}
    </figure>
  );
}

export function toMarkdown({ alt, caption }: MermaidProps): string {
  return `_[Diagram: ${caption || alt}]_\n\n`;
}
