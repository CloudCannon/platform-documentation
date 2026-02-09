interface ExampleProps {
  open_label?: string;
  close_label?: string;
  children: unknown;
}

export default function Example(
  { open_label = "Show example", close_label = "Hide example", children }:
    ExampleProps,
) {
  return (
    <details className="c-example">
      <summary data-pagefind-ignore>
        <span className="__open">{open_label}</span>
        <span className="__close">{close_label}</span>
      </summary>
      {children}
    </details>
  );
}
