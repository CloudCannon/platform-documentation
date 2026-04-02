import ImageWrapper from "./ImageWrapper.tsx";
import type { Helpers } from "../_types.d.ts";

interface DocsImageProps {
  type?: string;
  path: string;
  alt?: string;
  title?: string;
}

export default function DocsImage(
  { type, path, alt, title }: DocsImageProps,
  helpers: Helpers,
) {
  return (
    <ImageWrapper src={helpers.url(path)} alt={alt} title={title} type={type} />
  );
}

export function toMarkdown({ path, alt, title }: DocsImageProps): string {
  return `![${alt || title || ""}](${path})\n\n`;
}
