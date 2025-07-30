const fs = require("fs");
const yaml = require('js-yaml');

// Get document, or throw exception on error
try {
  console.log("combining resources...")
  
  let config = yaml.load(fs.readFileSync("cloudcannon.config.yml", 'utf8'));
  fs.writeFileSync("cloudcannon.config.yml",yaml.dump(config, {lineWidth:-1, forceQuotes:true}));
  console.log("done writing new config...")
} catch (e) {
  console.log(e);
}