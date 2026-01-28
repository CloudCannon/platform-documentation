import ImageWrapper from './ImageWrapper.jsx';

export default function ({ comp, type, path, alt, title }, helpers) {
    return <ImageWrapper src={helpers.url(path)} alt={alt} title={title} type={type} />;
}