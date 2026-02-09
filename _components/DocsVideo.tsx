interface DocsVideoProps {
  title?: string;
  url: string;
  autoplay?: boolean;
  loop?: boolean;
}

export default function DocsVideo(
  { title, url, autoplay, loop }: DocsVideoProps,
) {
  let videoProps: Record<string, unknown> = {};
  if (autoplay) {
    videoProps = {
      autoPlay: true,
      muted: true,
      defaultmuted: "true",
      playsInline: true,
      ...videoProps,
    };
  }
  if (loop) {
    videoProps.loop = true;
  }

  return (
    <video
      className="c-docs-video"
      title={title}
      {...videoProps}
    >
      <source src={url} type="video/mp4"></source>
    </video>
  );
}
