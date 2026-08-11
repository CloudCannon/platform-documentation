import {
  CliCommandDocumentation,
  cliCommandUrl,
  cliDocs,
  walkCommands,
} from "../_shared/command-line-interface.ts";

interface PageData {
  url: string;
  layout: string;
  command: CliCommandDocumentation;
  title: string;
  description: string;
}

export default function* (): Generator<PageData> {
  for (const topLevelCommand of cliDocs.subCommands ?? []) {
    for (const command of walkCommands(topLevelCommand)) {
      yield {
        url: cliCommandUrl(command),
        layout: "layouts/cli-reference.tsx",
        command,
        title: command.fullName,
        description: command.description ??
          `Reference for the ${command.fullName} command.`,
      };
    }
  }
}
