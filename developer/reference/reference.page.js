export default function* ({ search }) {
  for (const entry of Object.values(DOCS)) {
    yield {
      url: `/developer-reference/${entry.url}/`,
      layout: "layouts/reference.njk",
      entry
    };
  }
}