import { slugify } from "../utils/string-util.ts";
import type { CliCommandDocumentation } from "../../developer/reference/_shared/command-line-interface.ts";

interface Props {
  command?: CliCommandDocumentation;
  withHeading?: boolean;
}

export default function CliTableOfContents(
  { command, withHeading = false }: Props,
): JSX.Component | undefined {
  const subCommands = command?.subCommands ?? [];

  if (subCommands.length === 0) {
    return;
  }

  return (
    <>
      {withHeading && (
        <h3 className="l-toc__heading" data-pagefind-ignore>
          On this page
        </h3>
      )}
      <ol className="l-toc__list" data-pagefind-ignore>
        {subCommands.map((subCommand) => {
          const id = `command-${slugify(subCommand.name)}`;

          return (
            <li
              key={subCommand.name}
              x-bind:class={`visibleHeadingId === '${id}' ? 'active' : ''`}
            >
              <a href={`#${id}`}>
                <code className="code-no-box">{subCommand.name}</code>
              </a>
            </li>
          );
        })}
      </ol>
    </>
  );
}
