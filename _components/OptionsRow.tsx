import type { Helpers } from "../_types.d.ts";

interface OptionsRowProps {
  label: string;
  type_markdown?: string;
  required?: boolean;
  children: unknown;
}

export default function OptionsRow(
  { label, type_markdown, required, children }: OptionsRowProps,
  helpers: Helpers,
) {
  return (
    <div className="c-data-reference__item">
      <div className="c-data-reference__header">
        <code className="c-data-reference__key code-no-box">
          <strong>{label}</strong>
        </code>
        {type_markdown && " "}
        {type_markdown &&
          (
            <span
              dangerouslySetInnerHTML={{
                __html: helpers.md(type_markdown).replace(/^<p>/, " — ")
                  .replace(/<\/p>$/, ""),
              }}
            />
          )}
        {required && " "}
        {required && <small className="pill pill--red">Required</small>}
      </div>
      <div className="c-data-reference__description">{children}</div>
    </div>
  );
}

export function toMarkdown(
  { label, type_markdown }: OptionsRowProps,
  childrenMd: string,
): string {
  const type = type_markdown ? ` ${type_markdown}` : "";
  return `**\`${label}\`**${type}\n\n${childrenMd.trim()}\n\n`;
}
