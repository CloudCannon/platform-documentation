export default function ({title, url, autoplay, loop}) {
    let videoProps = {};
    if (autoplay) {
        videoProps = {autoPlay: true, muted: true, defaultmuted: "true", playsInline: true, ...videoProps};
    }
    if (loop) {
        videoProps.loop = true;
    }

    return (
        <video 
            className="c-docs-video"
            title={title}
            {...videoProps}>
                <source src={url} type="video/mp4"></source>
        </video>
    );
}