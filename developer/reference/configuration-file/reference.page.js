export default function* () {
  for (const entry of Object.values(DOCS)) {
    if(entry.gid && entry.url != "/")
      yield {
        url: `/developer-reference/configuration-file/${entry.url}/`,
        layout: "layouts/automated-reference.jsx",
        entry,
        // Page title for base layout
        title: entry.title || entry.key,
        description: entry.description || `Documentation for ${entry.key}`,
      };
  }
}