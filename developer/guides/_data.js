
export const url = (page) => {
  let u = page.data.url
  u = u.split("/").slice(3)
  return `/developer-guides/${u.join("/")}`;
}
export const layout = "layouts/guide.njk"