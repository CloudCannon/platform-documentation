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
