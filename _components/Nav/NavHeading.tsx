interface NavHeadingProps {
    title: string;
    icon?: unknown;
    openLabel?: string;
    closeLabel?: string;
    popoverId?: string;
}

/**
 * NavHeading - Navigation header with mobile toggle controls
 * 
 * Shared component for navigation headers across DocNav, ChangeNav, GlossaryNav, etc.
 * Includes the title and open/close buttons for mobile navigation using the Popover API.
 */
export default function NavHeading({ 
    title, 
    icon,
    openLabel = "Open docs menu",
    closeLabel = "Close docs menu",
    popoverId = "docs-nav-popover"
}: NavHeadingProps) {
    return (
        <div className="t-docs-nav__heading">
            {icon}
            <h2>{title}</h2>
            <button 
                type="button"
                className="t-docs-nav__control t-docs-nav__control--open" 
                popovertarget={popoverId}
                aria-label={openLabel}
            >
                <img src="/assets/img/expand.svg" inline="true" />
            </button>
            <button 
                type="button"
                className="t-docs-nav__control t-docs-nav__control--close" 
                popovertarget={popoverId}
                popovertargetaction="hide"
                aria-label={closeLabel}
            >
                <img src="/assets/img/close.svg" inline="true" />
            </button>
        </div>
    );
}
