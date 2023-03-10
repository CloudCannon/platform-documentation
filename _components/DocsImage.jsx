export default function ({comp, type, path, alt}, helpers) {
    let imageClass = "c-docs-image";
    if (type === "screenshot") {
        imageClass += " c-docs-image--type-screenshot";
    }
    return (
        <div className="c-docs-image__wrapper">
            <div className={imageClass}>
                <img className="c-docs-image__image" src={helpers.url(path)} alt={alt} loading="lazy" />
            </div>
        </div>
    );
}