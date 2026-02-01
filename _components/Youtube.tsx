import VideoEmbed from "./VideoEmbed.tsx";

interface YoutubeProps {
  id: string;
  title?: string;
}

export default function Youtube({ id, title = "Untitled" }: YoutubeProps) {
  return <VideoEmbed platform="youtube" id={id} title={title} />;
}
