import type { Helpers } from "../_types.d.ts";

interface OptionsRowProps {
  label: string;
  href?: string;
  id?: string;
  type_markdown?: string;
  required?: boolean;
  children: unknown;
}

export default function OptionsRow(
  { label, href, id, type_markdown, required, children }: OptionsRowProps,
  helpers: Helpers,
) {
  const labelCode = <code class="code-no-box">{label}</code>;

  return (
    <div className="c-data-reference__item" id={id}>
      <div className="c-data-reference__header">
        <span className="c-data-reference__key">
          <strong>
            {href ? <a href={href}>{labelCode}</a> : labelCode}
          </strong>
        </span>
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
  { label, href, type_markdown }: OptionsRowProps,
  childrenMd: string,
): string {
  const type = type_markdown ? ` ${type_markdown}` : "";
  const labelMd = href ? `**[\`${label}\`](${href})**` : `**\`${label}\`**`;
  return `${labelMd}${type}\n\n${childrenMd.trim()}\n\n`;
}
