import { slugify } from "../../../../_components/utils/string-util.ts";

export const type = "api-changelog";
export const tags = ["api-changelog"];
export const layout = "layouts/api-changelog.tsx";

interface Page {
  src: {
    ext: string;
    path: string;
    slug: string;
  };
  data: {
    title: string;
  };
}

// Entries live at YYYY/MM-DD_title.mdx, like the main changelogs.
function parseApiChangelogPath(path: string): Date | undefined {
  const [year, filename] = path.split("/").slice(-2);
  const [month, day] = (filename ?? "").split("_")[0].split("-");
  if (!/^\d{4}$/.test(year ?? "") || !month || !day) {
    return;
  }
  return new Date(`${year}-${month}-${day}`);
}

export function url(page: Page): string | undefined {
  if (page.src.ext !== ".mdx") {
    return;
  }
  const dateObj = parseApiChangelogPath(page.src.path);
  if (!dateObj) {
    return;
  }
  return `/developer-reference/api/changelog/${dateObj.getFullYear()}/${
    (dateObj.getMonth() + 1).toString().padStart(2, "0")
  }/${dateObj.getDate().toString().padStart(2, "0")}/${
    slugify(page.data.title)
  }/`;
}
