import type { Comp, Helpers } from "../_types.d.ts";

interface DocsImageProps {
  type?: string;
  path: string;
  alt?: string;
  title?: string;
  comp: Comp;
}

export default function DocsImage(
  { comp, type, path, alt, title }: DocsImageProps,
  helpers: Helpers,
) {
  return (
    <comp.ImageWrapper src={helpers.url(path)} alt={alt} title={title} type={type} />
  );
}

export function toMarkdown({ path, alt, title }: Omit<DocsImageProps, "comp">): string {
  return `![${alt || title || ""}](${path})\n\n`;
}
