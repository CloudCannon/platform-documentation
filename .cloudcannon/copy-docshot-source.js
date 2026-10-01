import { parse as yamlParse, stringify as yamlStringify } from "yaml";

// Get document, or throw exception on error
try {
  console.log("writing new config...");
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
  console.log("done writing new config...");
} catch (e) {
  console.log(e);
}
