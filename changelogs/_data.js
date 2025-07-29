import slugify from "npm:@sindresorhus/slugify@2.2.0";

export const type = 'changelog'
export const tags = ['changelogs']
export const layout = 'layouts/changelog.njk'

export function url(page) {
  if(page.src.ext == ".mdx")
  {
    const dateObj = new Date(page.data.date);
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    const title = page.data.title;
    if(!title)
      console.log("no title???", page)
    return `/changelog/${year}/${month}-${day}_${slugify(title)}/`;
  }
  return page.src.slug
}