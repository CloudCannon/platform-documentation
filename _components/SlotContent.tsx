interface SlotContentProps {
  name: string;
  children: unknown;
}

export default function SlotContent({ name, children }: SlotContentProps) {
  return (
    <div data-common-content-slot-content={name}>
      {children}
    </div>
  );
}
