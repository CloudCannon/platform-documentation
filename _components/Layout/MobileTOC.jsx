/**
 * MobileTOC - Mobile Table of Contents component
 * 
 * A collapsible table of contents for mobile viewports.
 * Renders the same TOC that appears in the desktop sidebar but in a mobile-friendly accordion.
 * 
 * @param {Object} props
 * @param {Object} props.helpers - Lume helpers (for icon function)
 * @param {React.ReactNode} props.children - Optional custom content for the TOC list
 * @param {string} props.listClassName - Optional custom class for the list div (default: "l-toc__list")
 */
export default function MobileTOC({ helpers, children, listClassName = "l-toc__list" }) {
    return (
        <div className="l-toc-mobile" x-data="{toc_open:false}" alpine:click="toc_open = !toc_open">
            <h3 alpine:class="toc_open ? 'open' : ''">
                Table of contents{' '}
                <img src={helpers.icon("arrow_forward_ios:outlined", "material")} inline="true" />
            </h3>
            <div className={listClassName} alpine:class="toc_open ? 'open' : ''">
                {children}
            </div>
        </div>
    );
}
