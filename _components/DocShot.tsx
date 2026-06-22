import type { Comp, Helpers } from "../_types.d.ts";

interface DocShotProps {
  type?: string;
  docshot_key: string;
  alt?: string;
  title?: string;
  docshots: {
    source: string;
  };
  comp: Comp;
}

export default function DocShot(
  { comp, type, docshot_key, alt, title, docshots }: DocShotProps,
  helpers: Helpers,
) {
  const local = Deno.env.get("DOCSHOTS_LOCAL");
  const finalPath = local
    ? `/documentation/local-docshots/${docshot_key}.webp`
    : `https://cc-screenshots.imgix.net/${docshots.source}/${docshot_key}.webp`;
  return (
    <comp.ImageWrapper
      src={helpers.url(finalPath)}
      alt={alt}
      title={title}
      type={type}
    />
  );
}

export function toMarkdown(
  { docshot_key, alt, title, docshots }: Omit<DocShotProps, "comp">,
): string {
  const url =
    `https://cc-screenshots.imgix.net/${docshots.source}/${docshot_key}.webp`;
  return `![${alt || title || "Screenshot"}](${url})\n\n`;
}
