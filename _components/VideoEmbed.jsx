/**
 * VideoEmbed - Unified component for embedding videos from various platforms
 * 
 * Supports YouTube, Vimeo, and custom URLs. Uses iframe embedding.
 * 
 * @param {Object} props
 * @param {"youtube" | "vimeo" | "custom"} props.platform - The video platform
 * @param {string} props.id - Video ID (for YouTube/Vimeo)
 * @param {string} props.url - Full URL (for custom embeds)
 * @param {string} props.title - Video title for accessibility (default: "Video")
 * @param {boolean} props.autoplay - Whether to autoplay (Vimeo only)
 * @param {boolean} props.loop - Whether to loop (Vimeo only)
 * @param {number} props.width - iframe width (default: 560)
 * @param {number} props.height - iframe height (default: 315)
 */
export default function VideoEmbed({ 
    platform = "custom",
    id,
    url,
    title = "Video",
    autoplay = false,
    loop = false,
    width = 560,
    height = 315
}) {
    // Build the embed URL based on platform
    let embedUrl = url;
    let allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    
    if (platform === "youtube" && id) {
        embedUrl = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&showinfo=0`;
    } else if (platform === "vimeo" && id) {
        embedUrl = `https://player.vimeo.com/video/${id}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}`;
        allow += "; autoplay; loop;";
    }
    
    if (!embedUrl) {
        return null;
    }
    
    return (
        <div className="c-youtube">
            <iframe 
                width={width} 
                height={height} 
                src={embedUrl}
                title={title}
                frameBorder="0"
                allow={allow}
                allowFullScreen
            />
        </div>
    );
}
