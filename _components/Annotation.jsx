export default function ({comp, number, children}) {
    return (
        <div className="c-annotation" data-annotation-number={number}>
            <div data-pagefind-ignore="all" data-annotation-number={number} className="c-annotation__number code-annotation">
            </div>
            <div className="c-annotation__content">
                {children}
            </div>
        </div>
    );
}
