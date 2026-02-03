export const layout = "layouts/changelog-list.tsx";
import { parseChangelogFilename } from "./parseChangelogFilename.ts";

interface ChangelogEntry {
  date: string;
  url: string;
  page: {
    src: {
      path: string;
    };
  };
}

interface Search {
  pages: (query: string) => ChangelogEntry[];
}

interface PageData {
  url: string;
  data: {
    title: string;
    results: ChangelogEntry[];
    newestYear: number;
  };
}

export default function* ({ search }: { search: Search }): Generator<PageData> {
  // Search by URL pattern - pages in changelogs folder
  const entries = search.pages("url^=/documentation/changelog/");

  // Sort newest first
  const sorted = entries.sort(
    (a, b) => {
      const bDate = parseChangelogFilename(b.page.src.path);
      const aDate = parseChangelogFilename(a.page.src.path);
      return bDate ? (aDate ? bDate.getTime() - aDate.getTime() : 1) : -1;
    },
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
