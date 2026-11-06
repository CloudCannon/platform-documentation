interface ImageWrapperProps {
  src: string;
  alt?: string;
  title?: string;
  type?: string;
  zoomable?: boolean;
}

/**
 * ImageWrapper - Shared wrapper component for documentation images
 *
 * Provides consistent styling and structure for images in docs.
 * Used by DocsImage and DocShot components.
 */
export default function ImageWrapper(
  { src, alt, title, type, zoomable }: ImageWrapperProps,
) {
  let imageClass = "c-docs-image";
  if (type) {
    imageClass += ` c-docs-image--type-${type}`;
  }
  if (zoomable) {
    imageClass += " c-docs-image--zoomable";
  }

  return (
    <div className="c-docs-image__wrapper">
      <div className={imageClass}>
        <img
          className="c-docs-image__image"
          src={src}
          alt={alt}
          title={title}
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function toMarkdown({ src, alt, title }: ImageWrapperProps): string {
  return `![${alt || title || ""}](${src})\n\n`;
}
