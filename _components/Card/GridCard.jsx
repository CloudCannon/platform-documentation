/**
 * GridCard component for the outer wrapper cards on the home page.
 * These cards can contain list items (using Card component) or just simple content.
 * 
 * Uses .c-card-grid__card styling (see card-grid.scss).
 */
export default function GridCard({
    href,
    title,
    description,
    image,
    spanTwo = false,
    showArrow = false,
    headingLevel = 'h2',
    className = '',
    children,
    helpers,
    dataEditable = {},
    ...rest
}) {
    const isInteractive = Boolean(href);
    const Element = isInteractive ? 'a' : 'div';
    const Heading = headingLevel;
    
    // Build class names
    const cardClasses = [
        'c-card-grid__card',
        spanTwo && 'span-two',
        className
    ].filter(Boolean).join(' ');
    
    // Get arrow icon URL
    const arrowIconUrl = helpers?.icon?.('arrow_forward:outlined', 'material');
    
    // Common link props for interactive cards
    const allProps = isInteractive ? { href, ...rest } : { ...rest };
    
    return (
        <Element className={cardClasses} {...allProps}>
            {title && (
                <Heading {...(dataEditable.title || {})}>{title}</Heading>
            )}
            
            {description && (
                <p {...(dataEditable.description || {})}>{description}</p>
            )}
            
            {/* Custom children content (e.g., list items) */}
            {children}
            
            {/* Arrow for interactive cards */}
            {showArrow && arrowIconUrl && (
                <div>
                    <div className="c-card-grid__card-arrow">
                        <img src={arrowIconUrl} inline="true" alt="" aria-hidden="true" />
                    </div>
                </div>
            )}
            
            {/* Optional bottom image */}
            {image && (
                <div>
                    <div className="img-spacer"></div>
                    <img 
                        src={image} 
                        alt="" 
                        loading="lazy"
                        {...(dataEditable.image || {})}
                    />
                </div>
            )}
        </Element>
    );
}
