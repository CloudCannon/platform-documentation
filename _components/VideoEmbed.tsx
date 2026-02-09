interface VideoEmbedProps {
  platform?: "youtube" | "vimeo" | "custom";
  id?: string;
  url?: string;
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
}

/**
 * VideoEmbed - Unified component for embedding videos from various platforms
 *
 * Supports YouTube, Vimeo, and custom URLs. Uses iframe embedding.
 */
export default function VideoEmbed({
  platform = "custom",
  id,
  url,
  title = "Video",
  autoplay = false,
  loop = false,
  width = 560,
  height = 315,
}: VideoEmbedProps) {
  // Build the embed URL based on platform
  let embedUrl = url;
  let allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

  if (platform === "youtube" && id) {
    embedUrl =
      `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&showinfo=0`;
  } else if (platform === "vimeo" && id) {
    embedUrl = `https://player.vimeo.com/video/${id}?autoplay=${
      autoplay ? 1 : 0
    }&loop=${loop ? 1 : 0}`;
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
