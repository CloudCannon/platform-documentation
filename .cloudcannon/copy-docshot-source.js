const fs = require("fs");
const yaml = require('js-yaml');

// Get document, or throw exception on error
try {
  console.log("writing new config...")
  const source = yaml.load(fs.readFileSync("_data/docshots.yml", 'utf8'));
  let config = yaml.load(fs.readFileSync("cloudcannon.config.yml", 'utf8'));
  config._snippets.docshot.preview.gallery.image[0].template = `'https://cc-screenshots.imgix.net/${source.source}/{docshot_key}.webp'`
  fs.writeFileSync("cloudcannon.config.yml",yaml.dump(config));
  console.log("done writing new config...")
} catch (e) {
  console.log(e);
}