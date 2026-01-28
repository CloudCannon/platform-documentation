/**
 * NavWrapper - Wrapper component for navigation sections
 * 
 * Provides the standard navigation container with Alpine.js state for 
 * mobile menu toggling. Use this as the outer wrapper for all nav components.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Navigation content
 * @param {string} props.id - ID for the nav element (default: "t-docs-nav")
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.withGradients - Whether to include scroll gradients (default: false)
 */
export default function NavWrapper({ 
    children, 
    id = "t-docs-nav", 
    className = "",
    withGradients = false
}) {
    const baseClass = "t-docs-nav";
    
    return (
        <nav 
            id={id}
            className={`${baseClass} ${className}`.trim()}
            alpine:class={`isPageNavOpen ? '${baseClass} ${baseClass}--open' : '${baseClass}'`}
            x-init="$getNavMemory?.()"
        >
            {children}
        </nav>
    );
}
