/**
 * ImageWrapper - Shared wrapper component for documentation images
 * 
 * Provides consistent styling and structure for images in docs.
 * Used by DocsImage and DocShot components.
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.title - Image title
 * @param {string} props.type - Optional type modifier for styling (e.g., "screenshot", "diagram")
 */
export default function ImageWrapper({ src, alt, title, type }) {
    let imageClass = "c-docs-image";
    if (type) {
        imageClass += ` c-docs-image--type-${type}`;
    }
    
    return (
        <div className="c-docs-image__wrapper">
            <div className={imageClass}>
                <img 
                    className="c-docs-image__image" 
                    src={src} 
                    alt={alt} 
                    title={title} 
                    loading="lazy" 
                />
            </div>
        </div>
    );
}
