import { slugify } from "../_components/utils/stringHelpers.ts";
import { parseChangelogFilename } from "../parseChangelogFilename.ts";

export const type = "changelog";
export const tags = ["changelogs"];
export const layout = "layouts/changelog.tsx";

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

export function url(page: Page): string | undefined {
  if (page.src.ext == ".mdx") {
    const dateObj = parseChangelogFilename(page.src.path);
    if (!dateObj) {
      return;
    }
    const title = page.data.title;

    return `/changelog/${dateObj.getFullYear()}/${
      dateObj.getMonth() + 1
    }/${dateObj.getDate()}/${slugify(title)}/`;
  }
  return page.src.slug;
}
