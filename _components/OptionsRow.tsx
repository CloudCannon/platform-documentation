import type { Helpers } from "../_types.d.ts";

interface OptionsRowProps {
  label: string;
  type_markdown?: string;
  children: unknown;
}

export default function OptionsRow(
  { label, type_markdown, children }: OptionsRowProps,
  helpers: Helpers,
) {
  return (
    <div className="c-data-reference__item">
      <div className="c-data-reference__header">
        <code className="c-data-reference__key">{label}</code>
        {type_markdown &&
          (
            <span
              dangerouslySetInnerHTML={{
                __html: helpers.md(type_markdown).replace(/^<p>/, " — ")
                  .replace(/<\/p>$/, ""),
              }}
            />
          )}
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
