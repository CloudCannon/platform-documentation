export const layout = "layouts/changelog-cards.njk";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function* ({ search }) {
  const entries = search.pages("changelogs");
  // Group changelogs by year, then by month
  const changelogsByYear = new Map();

  for (const entry of entries) {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    if (!changelogsByYear.has(year)) {
      changelogsByYear.set(year, new Map());
    }
    const yearMap = changelogsByYear.get(year);
    
    if (!yearMap.has(month)) {
      yearMap.set(month, []);
    }
    yearMap.get(month).push(entry);
  }

  // Find the oldest year
  const years = Array.from(changelogsByYear.keys());
  const oldestYear = Math.min(...years);

  // Generate a page for each year
  for (const [year, monthsMap] of changelogsByYear.entries()) {
    // Convert months map to sorted array (newest month first)
    const months = Array.from(monthsMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([month, results]) => {
        // Sort entries within month (newest first)
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        return {
          month: month + 1, // 1-12 for display
          name: monthNames[month],
          results,
        };
      });

    yield {
      url: `/changelog/${year}/`,
      data: {
        tags: [], // Override inherited changelogs tag so these don't appear in feed
        title: `Changelog ${year}`,
        year,
        months,
        isOldestYear: year === oldestYear,
      },
    };
  }
}
