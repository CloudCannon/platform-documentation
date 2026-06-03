interface OptionsTableProps {
  children: unknown;
}

export default function OptionsTable({ children }: OptionsTableProps) {
  return (
    <div className="c-data-reference">
      {children}
    </div>
  );
}

export function toMarkdown(_props: OptionsTableProps, childrenMd: string): string {
  return childrenMd;
}
