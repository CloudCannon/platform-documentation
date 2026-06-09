import type { Comp } from "../_types.d.ts";

interface VimeoProps {
  id: string;
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  comp: Comp;
}

export default function Vimeo(
  { comp, id, title = "Untitled", autoplay = false, loop = false }: VimeoProps,
) {
  return (
    <comp.VideoEmbed
      platform="vimeo"
      id={id}
      title={title}
      autoplay={autoplay}
      loop={loop}
    />
  );
}

export function toMarkdown({ id, title }: Omit<VimeoProps, "comp">): string {
  return `[Video: ${title || "Video"}](https://vimeo.com/${id})\n\n`;
}
