interface AnnotationProps {
  key?: string | number;
  number: number;
  children?: unknown;
  contentHtml?: string | undefined;
}

export default function Annotation(
  { number, children, contentHtml }: AnnotationProps,
) {
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

      {contentHtml
        ? (
          <div
            className="c-annotation__content"
            dangerouslySetInnerHTML={{
              __html: contentHtml,
            }}
          >
          </div>
        )
        : (
          <div className="c-annotation__content">
            {children}
          </div>
        )}
    </div>
  );
}

export function toMarkdown(
  { number }: AnnotationProps,
  childrenMd: string,
): string {
  return `**[${number}]** ${childrenMd.trim()}\n\n`;
}
