interface DataReferenceProps {
    children: unknown;
}

export default function DataReference({ children }: DataReferenceProps) {
    return (
      <div className="c-data-reference">
        {children}
      </div>
    );
}
