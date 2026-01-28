/**
 * NavHeading - Navigation header with mobile toggle controls
 * 
 * Shared component for navigation headers across DocNav, ChangeNav, GlossaryNav, etc.
 * Includes the title and open/close buttons for mobile navigation.
 * 
 * @param {Object} props
 * @param {string} props.title - The navigation section title
 * @param {React.ReactNode} props.icon - Optional icon to display before the title
 * @param {string} props.openLabel - Aria label for open button (default: "Open docs menu")
 * @param {string} props.closeLabel - Aria label for close button (default: "Close docs menu")
 */
export default function NavHeading({ 
    title, 
    icon,
    openLabel = "Open docs menu",
    closeLabel = "Close docs menu"
}) {
    return (
        <div className="t-docs-nav__heading">
            {icon}
            <h2>{title}</h2>
            <button 
                className="t-docs-nav__control" 
                x-on:click="isPageNavOpen = true; $focusNav(true);" 
                x-show="!isPageNavOpen" 
                aria-label={openLabel}
            >
                <img src="/assets/img/expand.svg" inline="true" />
            </button>
            <button 
                className="t-docs-nav__control" 
                x-on:click="isPageNavOpen = false; $focusNav(false);" 
                x-show="isPageNavOpen" 
                aria-label={closeLabel}
            >
                <img src="/assets/img/close.svg" inline="true" />
            </button>
        </div>
    );
}
