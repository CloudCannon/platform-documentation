export default function (
  { comp, type, docshot_key, alt, title, docshots },
  helpers,
) {
  let finalPath = `https://cc-screenshots.imgix.net/${docshots.source}/${docshot_key}.webp`;
  let imageClass = "c-docs-image";
  if (type) {
    imageClass += ` c-docs-image--type-${type}`;
  }
  return (
    <div className="c-docs-image__wrapper">
      <div className={imageClass}>
        <img
          className="c-docs-image__image"
          src={helpers.url(finalPath)}
          alt={alt}
          title={title}
          loading="lazy"
        />
      </div>
    </div>
  );
}
