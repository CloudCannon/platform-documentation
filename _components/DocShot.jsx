import ImageWrapper from './ImageWrapper.jsx';

export default function ({ comp, type, docshot_key, alt, title, docshots }, helpers) {
    const finalPath = `https://cc-screenshots.imgix.net/${docshots.source}/${docshot_key}.webp`;
    return <ImageWrapper src={helpers.url(finalPath)} alt={alt} title={title} type={type} />;
}
