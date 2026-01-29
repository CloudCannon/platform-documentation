interface ScrollGradientProps {
    position?: "top" | "bottom";
}

/**
 * ScrollGradient - Gradient overlay for scrollable navigation areas
 * 
 * Creates a fade effect at the top or bottom of scrollable containers
 * to indicate there's more content above/below. Uses CSS classes with
 * theme variables for proper dark mode support.
 * 
 * Requires parent container to have x-data="scrollContainer" for visibility state.
 */
export default function ScrollGradient({ position = "bottom" }: ScrollGradientProps) {
    const modifierClass = position === "top" 
        ? "c-scroll-area__gradient--top" 
        : "c-scroll-area__gradient--bottom";
    
    // scrolledDown: show top gradient when scrolled away from top
    // more: show bottom gradient when not at bottom (more content below)
    const showCondition = position === "top" ? "scrolledDown" : "more";
    
    return (
        <div 
            className={`c-scroll-area__gradient ${modifierClass}`}
            x-show={showCondition}
            x-transition:enter="transition-opacity duration-200"
            x-transition:leave="transition-opacity duration-200"
        />
    );
}
