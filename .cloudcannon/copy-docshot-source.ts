import { parse as yamlParse, stringify as yamlStringify } from "yaml";
import { blue, bold, red } from "@std/fmt/colors";

const LOG_PREFIX = blue("[copy-docshot-source]");
const WARN_PREFIX = red("[copy-docshot-source]");

// Get document, or throw exception on error
try {
  console.log(`${LOG_PREFIX} writing ${bold("cloudcannon.config.yml")}...`);
  const source = yamlParse(Deno.readTextFileSync("_data/docshots.yml"));
  const config = yamlParse(Deno.readTextFileSync("cloudcannon.config.yml"));
  config._snippets.docshot.preview.gallery.image[0].template =
    `https://cc-screenshots.imgix.net/${source.source}/{docshot_key}.webp`;
  Deno.writeTextFileSync(
    "cloudcannon.config.yml",
    yamlStringify(config, {
      lineWidth: 0,
      aliasDuplicateObjects: false,
      singleQuote: true,
      nullStr: "",
    }),
  );
  console.log(
    `${LOG_PREFIX} set docshot source to ${bold(source.source)} in ${bold("cloudcannon.config.yml")}`,
  );
} catch (e) {
  console.warn(
    `${WARN_PREFIX} could not update ${bold("cloudcannon.config.yml")}:`,
    e,
  );
}
