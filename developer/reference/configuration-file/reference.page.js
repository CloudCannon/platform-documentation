export default function* ({ search }) {
  for (const entry of Object.values(DOCS)) {
    if(entry.gid && entry.url != "/")
      yield {
        url: `/developer-reference/configuration-file/${entry.url}/`,
        layout: "layouts/automated-reference.njk",
        entry
      };
  }
}