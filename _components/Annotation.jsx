export default function ({comp, number, children}) {
    return (
        <div 
            className="c-annotation" 
            alpine:class={`highlighedAnnotation === ${number} ? "c-annotation c-annotation--highlighted" : "c-annotation"`}
            x-effect={`if (highlighedAnnotation === ${number}) { $el.scrollIntoView({ behavior: "smooth", block: "nearest" }) }`}
            data-annotation-number={number}>
            <div data-pagefind-ignore="all" data-annotation-number={number} className="c-annotation__number code-annotation">
            </div>
            <div className="c-annotation__content">
                {children}
            </div>
        </div>
    );
}
