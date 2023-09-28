export default function ({comp, name, children}, helpers) {
  return (
    <div data-common-content-slot-content={name}>
      {children}
    </div>
  );
}
