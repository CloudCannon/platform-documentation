export default function ({comp, number, children}) {
    return (
        <div className="c-annotation">
            <div data-pagefind-ignore="all" data-annotation-number={number} className="c-annotation__number">
            </div>
            <div className="c-annotation__content">
                {children}
            </div>
        </div>
    );
}
