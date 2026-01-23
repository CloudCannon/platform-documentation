export default function* ({ search }) {
  for (const entry of Object.values(DOCS)) {
    yield {
      url: `/developer-reference/cloudcannon-configuration-file/${entry.url}/`,
      layout: "layouts/automated-reference.njk",
      entry
    };
  }
}