export default function ({comp, id, title="Untitled"}) {
    return (
        <div className="c-youtube">
            <iframe width="560" height="315" src={`https://www.youtube.com/embed/${ id }?rel=0&modestbranding=1&showinfo=0`} title={title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
    );
}