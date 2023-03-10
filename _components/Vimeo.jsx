export default function ({comp, id, title="Untitled", autoplay=false, loop=false}) {

  const url = `https://player.vimeo.com/video/${ id }?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}`;

  return (
      <div className="c-youtube">
          <iframe 
          width="560" 
          height="315" 
          src={url}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay; loop;"
          allowFullScreen>
          </iframe>
      </div>
  );
}