export default function ({comp, title, url, autoplay, loop}, helpers) {
    let videoProps = {};
    if (autoplay) {
        videoProps = {autoPlay: true, muted: true, defaultmuted: "true", playsInline: true, ...videoProps};
    }
    if (loop) {
        videoProps.loop = true;
    }

    return (
        <video 
            {...videoProps}
            className="c-docs-video"
            title={title}>
                <source src={url} type="video/mp4"></source>
        </video>
    );
}