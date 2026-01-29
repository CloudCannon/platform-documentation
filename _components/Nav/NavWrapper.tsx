interface NavWrapperProps {
    children: unknown;
    id?: string;
    className?: string;
}

/**
 * NavWrapper - Wrapper component for navigation sections
 * 
 * Provides the standard navigation container with Alpine.js state for 
 * mobile menu toggling. Use this as the outer wrapper for all nav components.
 */
export default function NavWrapper({ 
    children, 
    id = "t-docs-nav", 
    className = ""
}: NavWrapperProps) {
    const baseClass = "t-docs-nav";
    
    return (
        <nav 
            id={id}
            className={`${baseClass} ${className}`.trim()}
            alpine:class={`isPageNavOpen ? '${baseClass} ${baseClass}--open' : '${baseClass}'`}
            x-init="$getNavMemory?.()"
            x-data="{height:0,scrollHeight:0,scrollTop:0}"
            x-ref="navParent"
            x-on:scroll="scrollTop = $el.scrollTop;console.log(height,scrollHeight,scrollTop)"
        >
            <div class="c-scroll-area__gradient c-scroll-area__gradient--top" 
            x-show="scrollHeight > height && scrollTop > 0"></div>
            {children}
            <div class="c-scroll-area__gradient c-scroll-area__gradient--bottom" 
            x-show="scrollHeight > height && (height+scrollTop) < scrollHeight"></div>
        </nav>
    );
}
