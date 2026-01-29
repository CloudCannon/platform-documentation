import VideoEmbed from "./VideoEmbed.tsx";

interface VimeoProps {
    id: string;
    title?: string;
    autoplay?: boolean;
    loop?: boolean;
}

export default function Vimeo({ id, title = "Untitled", autoplay = false, loop = false }: VimeoProps) {
    return <VideoEmbed platform="vimeo" id={id} title={title} autoplay={autoplay} loop={loop} />;
}
