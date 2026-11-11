interface ImageWrapperProps {
  src: string;
  alt?: string;
  title?: string;
  type?: string;
}

/**
 * ImageWrapper - Shared wrapper component for documentation images
 *
 * Provides consistent styling and structure for images in docs.
 * Used by DocsImage and DocShot components.
 */
export default function ImageWrapper(
  { src, alt, title, type }: ImageWrapperProps,
) {
  let imageClass = "c-docs-image";
  if (type) {
    imageClass += ` c-docs-image--type-${type}`;
  }

  // The caption repeats the alt text for sighted readers, so it is hidden from
  // screen readers, which already announce it from the image.
  return (
    <figure className="c-docs-image__wrapper">
      <div className={imageClass}>
        <img
          className="c-docs-image__image"
          src={src}
          alt={alt}
          loading="lazy"
        />
      </div>
      {(title || alt) && (
        <figcaption className="c-docs-image__caption">
          {title && <span className="c-docs-image__caption-title">{title}</span>}
          {alt && <span aria-hidden="true">{title ? ` · ${alt}` : alt}</span>}
        </figcaption>
      )}
    </figure>
  );
}

export function toMarkdown({ src, alt, title }: ImageWrapperProps): string {
  return `![${alt || title || ""}](${src}${title ? ` "${title}"` : ""})\n\n`;
}
