import ImageWrapper from "./ImageWrapper.tsx";
import type { Helpers } from "../_types.d.ts";

interface DocShotProps {
  type?: string;
  docshot_key: string;
  alt?: string;
  title?: string;
  docshots: {
    source: string;
  };
}

export default function DocShot(
  { type, docshot_key, alt, title, docshots }: DocShotProps,
  helpers: Helpers,
) {
  const local = Deno.env.get("DOCSHOTS_LOCAL");
  const finalPath = local
    ? `/documentation/local-docshots/${docshot_key}.webp`
    : `https://cc-screenshots.imgix.net/${docshots.source}/${docshot_key}.webp`;
  return (
    <ImageWrapper
      src={helpers.url(finalPath)}
      alt={alt}
      title={title}
      type={type}
    />
  );
}
