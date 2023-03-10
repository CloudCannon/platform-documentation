export const type = 'changelog'
export const layout = 'layouts/changelog.njk'

export function url(page) {
  const dateObj = new Date(page.data.date);
  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getUTCDate().toString().padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  return `/changelog/${year}/${month}/${day}/${page.src.slug}.html`;
}