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

  // Find the newest year from the results
  const newestYear = recent.length > 0 
    ? new Date(recent[0].date).getFullYear() 
    : new Date().getFullYear();

  yield {
    url: "/changelog/",
    data: {
      title: "Changelog",
      results: recent,
      newestYear,
    },
  };
}
