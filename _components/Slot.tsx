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
