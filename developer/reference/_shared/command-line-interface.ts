import cliDocumentation from "@cloudcannon/cli/dist/documentation.json" with {
  type: "json",
};

export const cliDocs = cliDocumentation as CliCommandDocumentation;

export interface CliArgDocumentation {
  name: string;
  type: "boolean" | "string" | "enum" | "positional";
  description?: string;
  valueHint?: string;
  alias?: string[];
  default?: boolean | number | string;
  options?: string[];
  required: boolean;
}

export interface CliCommandDocumentation {
  name: string;
  fullName: string;
  description?: string;
  version?: string;
  alias?: string[];
  usage: string;
  args?: CliArgDocumentation[];
  options?: CliArgDocumentation[];
  subCommands?: CliCommandDocumentation[];
}

export const CLI_BASE_PATH = "/developer-reference/cli/";

// Path segments below the root binary, e.g. "cloudcannon sites get" -> ["sites", "get"]
export function cliCommandPath(command: CliCommandDocumentation): string[] {
  return command.fullName.split(" ").slice(1);
}

export function cliCommandUrl(command: CliCommandDocumentation): string {
  return `${CLI_BASE_PATH}${cliCommandPath(command).join("/")}/`;
}

export function* walkCommands(
  command: CliCommandDocumentation,
): Generator<CliCommandDocumentation> {
  yield command;
  for (const subCommand of command.subCommands ?? []) {
    yield* walkCommands(subCommand);
  }
}
