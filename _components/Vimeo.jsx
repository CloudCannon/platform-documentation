import VideoEmbed from "./VideoEmbed.jsx";

export default function ({ comp, id, title = "Untitled", autoplay = false, loop = false }) {
    return <VideoEmbed platform="vimeo" id={id} title={title} autoplay={autoplay} loop={loop} />;
}