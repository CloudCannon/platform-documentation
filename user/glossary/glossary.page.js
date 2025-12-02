export default function* ({ search }) {
  for (const letter of [...Array(26).keys()].map((n) => String.fromCharCode(97 + n))) {
    yield {
      url: `/user-glossary/${letter}/`,
      layout: "layouts/glossary-list.njk"
    };
  }
}
