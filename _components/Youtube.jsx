import VideoEmbed from "./VideoEmbed.jsx";

export default function ({ id, title = "Untitled" }) {
    return <VideoEmbed platform="youtube" id={id} title={title} />;
}