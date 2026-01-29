export const layout = "layouts/changelog-cards.tsx";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface ChangelogEntry {
  date: string;
  url: string;
  page?: {
    data?: {
      title?: string;
      date?: string;
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
    year: number;
    months: Array<{
      month: number;
      name: string;
      results: ChangelogEntry[];
    }>;
    isOldestYear: boolean;
    isNewestYear: boolean;
    previousYear: number | null;
  };
}

export default function* ({ search }: { search: Search }): Generator<PageData> {
  const entries = search.pages("changelogs");
  // Group changelogs by year, then by month
  const changelogsByYear = new Map<number, Map<number, ChangelogEntry[]>>();

  for (const entry of entries) {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    if (!changelogsByYear.has(year)) {
      changelogsByYear.set(year, new Map());
    }
    const yearMap = changelogsByYear.get(year)!;
    
    if (!yearMap.has(month)) {
      yearMap.set(month, []);
    }
    yearMap.get(month)!.push(entry);
  }

  // Sort years and find oldest/newest
  const years = Array.from(changelogsByYear.keys()).sort((a, b) => b - a);
  const newestYear = years[0];
  const oldestYear = years[years.length - 1];

  // Generate a page for each year
  for (const [year, monthsMap] of changelogsByYear.entries()) {
    // Convert months map to sorted array (newest month first)
    const months = Array.from(monthsMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([month, results]) => {
        // Sort entries within month (newest first)
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
          month: month + 1, // 1-12 for display
          name: monthNames[month],
          results,
        };
      });

    // Find the previous year (if any)
    const yearIndex = years.indexOf(year);
    const previousYear = yearIndex < years.length - 1 ? years[yearIndex + 1] : null;

    yield {
      url: `/changelog/${year}/`,
      data: {
        title: `Changelog ${year}`,
        year,
        months,
        isOldestYear: year === oldestYear,
        isNewestYear: year === newestYear,
        previousYear,
      },
    };
  }
}
