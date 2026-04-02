interface SlotProps {
  name: string;
  children: unknown;
}

export default function Slot({ name, children }: SlotProps) {
  return (
    <div data-common-content-slot={name}>
      {children}
    </div>
  );
}

export function toMarkdown(_props: SlotProps, childrenMd: string): string {
  return childrenMd;
}
