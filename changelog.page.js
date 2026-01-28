export const layout = "layouts/changelog-list.njk";
import { parseChangelogFilename } from "./parseChangelogFilename.ts";

export default function* ({ search }) {
  // Search by URL pattern - pages in new_changelogs folder
  const entries = search.pages("url^=/documentation/changelog/");

  // Sort newest first
  const sorted = entries.sort(
    (a, b) => parseChangelogFilename(b.page.src.path) - parseChangelogFilename(a.page.src.path)
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
