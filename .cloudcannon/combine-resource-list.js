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
    console.log(entry);
    const data = matter(fs.readFileSync(entry));
    const obj = {
      path:entry,
      title:data.data.details.title,
      _uuid:data.data._uuid,
      description: data.data.details.description,
      category: data.data.details.category
    }
    all_resources.push(obj)
  }

  fs.writeFileSync("_data/combined_resource_list.yml",yaml.dump(all_resources));

  const all_guides = []
  const guides = fg.globSync(["developer/guides/**/*.yml","user/guides/**/*.yml"])
  for(const guide of guides)
  {
    const data = yaml.load(fs.readFileSync(guide, 'utf-8'));
    const obj = {
      path:guide,
      _uuid: data._uuid,
      guide_icon:data.guide_icon,
      guide_title: data.guide_title,
      guide_image:data.guide_image,
      guide_summary:data.guide_summary
    }
    all_guides.push(obj)
  }

  fs.writeFileSync("_data/combined_guides.yml",yaml.dump(all_guides));
} catch (err) {
    console.error('Error reading directory:', err);
}