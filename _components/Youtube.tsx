import type { Comp } from "../_types.d.ts";

interface YoutubeProps {
  id: string;
  title?: string;
  comp: Comp;
}

export default function Youtube({ comp, id, title = "Untitled" }: YoutubeProps) {
  return <comp.VideoEmbed platform="youtube" id={id} title={title} />;
}

export function toMarkdown({ id, title }: Omit<YoutubeProps, "comp">): string {
  return `[Video: ${title || "Video"}](https://www.youtube.com/watch?v=${id})\n\n`;
}
