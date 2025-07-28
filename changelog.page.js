export const layout = "layouts/changelog-list.njk";

export default function* ({ search }) {
  // Correct method in Lume v3
  const entries = search.pages("changelogs");
  //console.log(entries)

  // Sort newest first
  const sorted = entries.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const recent = sorted.slice(0, 3);

  yield {
    url: "/changelog/",
    data: {
      title: "Changelog",
      results: recent,
    },
  };
}
