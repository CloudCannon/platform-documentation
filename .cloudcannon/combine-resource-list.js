const fs = require('fs');
const fg = require('fast-glob');
const yaml = require('js-yaml');
const matter = require('gray-matter');

// Get document, or throw exception on error
console.log("combining resources...")
const all_resources = []
try {
  const entries = fg.globSync(["developer/**/*.mdx","user/**/*.mdx"])
  for(const entry of entries)
  {
    const data = matter(fs.readFileSync(entry));
    const obj = {
      path:entry,
      title:data.data.title,
      _uuid:data.data._uuid,
      description: data.data.description
    }
    all_resources.push(obj)
  }

  fs.writeFileSync("_data/combined_resource_list.yml",yaml.dump(all_resources));
} catch (err) {
    console.error('Error reading directory:', err);
}