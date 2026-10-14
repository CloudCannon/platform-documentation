import type { Comp, Helpers } from "../../_types.d.ts";
import { slugify } from "../utils/string-util.ts";
import {
  CliArgDocumentation,
  CliCommandDocumentation,
  cliCommandUrl,
} from "../../developer/reference/_shared/command-line-interface.ts";

interface Props {
  command: CliCommandDocumentation;
  helpers: Helpers;
  comp: Comp;
}

function formatDefault(arg: CliArgDocumentation): string {
  if (arg.default === undefined) {
    return "";
  }

  return typeof arg.default === "string"
    ? `"${arg.default}"`
    : String(arg.default);
}

function formatLabel(arg: CliArgDocumentation): string {
  const name = arg.type === "positional"
    ? arg.name.toUpperCase()
    : `${
      (arg.alias ?? []).map((alias) => `-${alias}, `).join("")
    }--${arg.name}`;

  if (arg.type === "boolean") {
    return name;
  }

  const valueHint = arg.type === "positional"
    ? arg.valueHint
    : arg.valueHint ?? arg.name.replaceAll("-", "_");

  return valueHint ? `${name}=<${valueHint}>` : name;
}

function ensureTrailingPeriod(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function OptionsList(
  { comp, args, helpers }: {
    comp: Comp;
    args: CliArgDocumentation[];
    helpers: Helpers;
  },
) {
  return (
    <comp.OptionsTable>
      {args.map((arg) => (
        <comp.OptionsRow
          key={arg.name}
          label={formatLabel(arg)}
          required={arg.required}
        >
          {arg.description && (
            <p
              dangerouslySetInnerHTML={{
                __html: helpers.md(ensureTrailingPeriod(arg.description), true),
              }}
            />
          )}

          {formatDefault(arg) && (
            <p>
              <em>Defaults to:</em> <code>{formatDefault(arg)}</code>.
            </p>
          )}
        </comp.OptionsRow>
      ))}
    </comp.OptionsTable>
  );
}

export default function CliReferenceContent(
  { comp, command, helpers }: Props,
) {
  const subCommands = command.subCommands ?? [];

  return (
    <>
      {command.description && (
        <>
          <h2 class="c-anchor-header exclude-from-toc" id="description">
            Description
          </h2>
          <p
            dangerouslySetInnerHTML={{
              __html: helpers.md(
                ensureTrailingPeriod(command.description),
                true,
              ),
            }}
          />
        </>
      )}

      <h2 class="c-anchor-header exclude-from-toc" id="usage">Usage</h2>
      <pre>
        <code>{command.usage}</code>
      </pre>

      {command.args && command.args.length > 0 && (
        <>
          <h2 class="c-anchor-header exclude-from-toc" id="arguments">
            Arguments
          </h2>
          <OptionsList
            comp={comp}
            args={command.args}
            helpers={helpers}
          />
        </>
      )}

      {command.options && command.options.length > 0 && (
        <>
          <h2 class="c-anchor-header exclude-from-toc" id="options">Options</h2>
          <OptionsList
            comp={comp}
            args={command.options}
            helpers={helpers}
          />
        </>
      )}

      {subCommands.length > 0 && (
        <>
          <h2 class="c-anchor-header exclude-from-toc" id="commands">
            Commands
          </h2>
          <comp.OptionsTable>
            {subCommands.map((subCommand) => (
              <comp.OptionsRow
                key={subCommand.name}
                id={`command-${slugify(subCommand.name)}`}
                label={subCommand.name}
                href={helpers.url(cliCommandUrl(subCommand))}
              >
                {subCommand.description && (
                  <p
                    dangerouslySetInnerHTML={{
                      __html: helpers.md(
                        ensureTrailingPeriod(subCommand.description),
                        true,
                      ),
                    }}
                  />
                )}
              </comp.OptionsRow>
            ))}
          </comp.OptionsTable>
        </>
      )}
    </>
  );
}
