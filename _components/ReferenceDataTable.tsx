interface ReferenceDataTableProps {
  children: unknown;
}

export default function ReferenceDataTable(
  { children }: ReferenceDataTableProps,
) {
  return (
    <div className="c-data-reference">
      {children}
    </div>
  );
}

export function toMarkdown(
  _props: ReferenceDataTableProps,
  childrenMd: string,
): string {
  return childrenMd;
}
