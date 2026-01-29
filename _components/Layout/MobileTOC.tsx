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
 * Renders the same TOC that appears in the desktop sidebar but in a mobile-friendly accordion.
 */
export default function MobileTOC({ helpers, children, listClassName = "l-toc__list" }: MobileTOCProps) {
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
