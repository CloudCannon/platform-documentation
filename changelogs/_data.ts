import { slugify } from "../_components/utils/string-util.ts";
import { parseChangelogFilename } from "../parseChangelogFilename.ts";

export const type = "changelog";
export const tags = ["changelogs"];
export const layout = "layouts/changelog.tsx";

// In dev mode (serve), only build changelogs from the last N months for faster
// builds. Override the window with CHANGELOG_MONTHS. Production builds are
// unaffected.
const isDevMode = Deno.args.includes("-s") || Deno.args.includes("--serve");
const changelogMonths = Number(Deno.env.get("CHANGELOG_MONTHS") ?? "6");
const changelogCutoff = new Date();
changelogCutoff.setMonth(changelogCutoff.getMonth() - changelogMonths);

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

export function url(page: Page): string | false | undefined {
  if (page.src.ext == ".mdx") {
    const dateObj = parseChangelogFilename(page.src.path);
    if (!dateObj) {
      return;
    }
    if (isDevMode && dateObj < changelogCutoff) {
      return false;
    }
    const title = page.data.title;

    return `/changelog/${dateObj.getFullYear()}/${
      (dateObj.getMonth() + 1).toString().padStart(2, '0')
    }/${dateObj.getDate().toString().padStart(2, '0')}/${slugify(title)}/`;
  }
  return page.src.slug;
}
