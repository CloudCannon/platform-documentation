interface ApiChangelogEntry {
  url: string;
}

interface Search {
  pages: (query: string, sort?: string) => ApiChangelogEntry[];
}

// The API changelog list: every entry tagged api-changelog, newest first.
export default function* ({ search }: { search: Search }) {
  yield {
    url: "/developer-reference/api/changelog/",
    layout: "layouts/api-changelog.tsx",
    title: "API Changelog",
    api_changelog_entries: search.pages("api-changelog", "date=desc"),
  };
}
