import ImageWrapper from './ImageWrapper.jsx';

export default function ({ type, path, alt, title }, helpers) {
    return <ImageWrapper src={helpers.url(path)} alt={alt} title={title} type={type} />;
}