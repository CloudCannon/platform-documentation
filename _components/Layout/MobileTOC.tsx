interface MobileTOCProps {
  helpers: {
    icon: (name: string, set: string) => string;
  };
  children?: unknown;
  listClassName?: string;
}

/**
 * MobileTOC - Mobile Table of Contents component
 *
 * A collapsible table of contents for mobile viewports.
 * Uses native <details>/<summary> for JS-free interactivity.
 * Renders the same TOC that appears in the desktop sidebar but in a mobile-friendly accordion.
 */
export default function MobileTOC(
  { helpers, children, listClassName = "l-toc__list" }: MobileTOCProps,
) {
  return (
    <details className="l-toc-mobile" data-pagefind-ignore>
      <summary>
        <h3>
          Table of contents{" "}
          <img
            src={helpers.icon("arrow_forward_ios:outlined", "material")}
            inline="true"
          />
        </h3>
      </summary>
      <div className={listClassName}>
        {children}
      </div>
    </details>
  );
}
