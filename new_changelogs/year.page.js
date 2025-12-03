export const layout = "layouts/changelog-cards.njk";
export default function* ({ search }) {
  const entries = search.pages("changelogs");
  // Group changelogs by year
  const changelogsByYear = new Map();

  for (const entry of entries) {
    const date = entry.date;
    const year = new Date(date).getFullYear(); // fallback to title if needed
    
    if (!changelogsByYear.has(year)) {
      changelogsByYear.set(year, []);
    }
    changelogsByYear.get(year).push(entry);
  }

  // Generate a page for each year
  for (const [year, results] of changelogsByYear.entries()) {
    results.sort((a, b) => new Date(b.date) - new Date(a.date));
    yield {
      url: `/changelog/${year}/`,
      data: {
        title: `Changelog ${year}`,
        year,
        results,
      },
    };
  }
}
