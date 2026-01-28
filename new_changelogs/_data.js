import slugify from "npm:@sindresorhus/slugify@2.2.0";
import { parseChangelogFilename } from "../parseChangelogFilename.ts";

export const type = 'changelog'
export const tags = ['changelogs']
export const layout = 'layouts/changelog.jsx'

export function url(page) {
  if (page.src.ext == ".mdx") {
    const dateObj = parseChangelogFilename(page.src.path);
    if (!dateObj) {
        return;
    }
    const title = page.data.title;

    return `/changelog/${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}/${slugify(title)}/`;
  }
  return page.src.slug
}