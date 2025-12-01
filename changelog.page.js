export const layout = "layouts/changelog-list.njk";
import { parseChangelogFilename } from "./parseChangelogFilename.ts";

export default function* ({ search }) {
  // Correct method in Lume v3
  const entries = search.pages("new_changelogs");

  // Sort newest first
  const sorted = entries.sort(
    (a, b) => parseChangelogFilename(b.src.path) - parseChangelogFilename(a.src.path)
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
