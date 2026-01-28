/**
 * ContentSplit - Main content area with TOC sidebar
 * 
 * A two-column layout with main content on the left and table of contents on the right.
 * Supports pagefind indexing and Alpine.js scroll highlighting.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The main content
 * @param {string} props.tocClassName - CSS class for the TOC container (default: "l-toc")
 * @param {string} props.site - Site name for pagefind filtering (e.g., "Documentation", "Changelog", "Guides")
 * @param {boolean} props.pagefindBody - Whether to add data-pagefind-body to the wrapper (default: false)
 * @param {React.ReactNode} props.tocContent - Optional custom TOC content
 */
export default function ContentSplit({ 
    children, 
    tocClassName = "l-toc",
    site,
    pagefindBody = false,
    tocContent
}) {
    const wrapperProps = {
        className: "l-content-split",
        "x-data": "$visibleNavHighlighter"
    };
    
    // Add pagefind attributes if site is specified
    if (pagefindBody) {
        wrapperProps["data-pagefind-body"] = "";
    }
    if (site) {
        wrapperProps["data-pagefind-filter"] = `site:${site}`;
        wrapperProps["data-pagefind-meta"] = `site:${site}`;
    }
    
    return (
        <div {...wrapperProps}>
            <main>
                {children}
            </main>
            <aside data-pagefind-ignore="" className="l-right">
                <div className={tocClassName} alpine:scroll="onScroll()">
                    {tocContent}
                </div>
            </aside>
        </div>
    );
}
