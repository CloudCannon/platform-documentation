interface ScrollGradientProps {
    position?: "top" | "bottom";
}

/**
 * ScrollGradient - Gradient overlay for scrollable navigation areas
 * 
 * Creates a fade effect at the top or bottom of scrollable containers
 * to indicate there's more content above/below.
 */
export default function ScrollGradient({ position = "bottom" }: ScrollGradientProps) {
    const isTop = position === "top";
    
    const baseStyle = {
        position: 'sticky' as const,
        zIndex: 0,
        pointerEvents: 'none' as const,
        width: 'calc(100% + 16px)',
        opacity: '1',
        height: '100px',
    };
    
    return (
        <div 
            className="c-scroll-area__gradient c-scroll-area__gradient--bottom"
            style={isTop 
                ? { ...baseStyle, top: 0, marginBottom: '-100px', background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), transparent 70%)' }
                : { ...baseStyle, bottom: 0, marginTop: '-100px', background: 'linear-gradient(to top, rgba(255, 255, 255, 1), transparent 70%)' }
            }
            x-show="$el.scrollHeight > $el.clientHeight"
        />
    );
}
