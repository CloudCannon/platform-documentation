export default function ({name, children}) {
  return (
    <div data-common-content-slot-content={name}>
      {children}
    </div>
  );
}
