/**
 * ScrollGradient - Gradient overlay for scrollable navigation areas
 * 
 * Creates a fade effect at the top or bottom of scrollable containers
 * to indicate there's more content above/below.
 * 
 * @param {Object} props
 * @param {"top" | "bottom"} props.position - Where to position the gradient
 */
export default function ScrollGradient({ position = "bottom" }) {
    const isTop = position === "top";
    
    const style = {
        position: 'sticky',
        zIndex: 0,
        pointerEvents: 'none',
        width: 'calc(100% + 16px)',
        opacity: 1,
        height: '100px',
        ...(isTop ? {
            top: 0,
            marginBottom: '-100px',
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), transparent 70%)'
        } : {
            bottom: 0,
            marginTop: '-100px',
            background: 'linear-gradient(to top, rgba(255, 255, 255, 1), transparent 70%)'
        })
    };
    
    return (
        <div 
            className="c-scroll-area__gradient c-scroll-area__gradient--bottom"
            style={style}
            x-show="$el.scrollHeight > $el.clientHeight"
        />
    );
}
