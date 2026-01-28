export default function ({name, children}) {
  return (
      <div data-common-content-slot={name}>
        {children}
      </div>
  );
}
