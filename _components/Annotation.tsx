interface AnnotationProps {
  key?: string | number;
  number: number;
  children: unknown;
}

export default function Annotation({ number, children }: AnnotationProps) {
  return (
    <div
      className="c-annotation"
      alpine:class={`highlighedAnnotation === ${number} ? "c-annotation c-annotation--highlighted" : "c-annotation"`}
      x-effect={`if (highlighedAnnotation === ${number}) { $el.scrollIntoView({ behavior: "smooth", block: "nearest", container: 'nearest' }) }`}
      data-annotation-number={number}
    >
      <div
        data-pagefind-ignore="all"
        data-annotation-number={number}
        className="c-annotation__number code-annotation"
      >
      </div>
      <div className="c-annotation__content">
        {children}
      </div>
    </div>
  );
}
