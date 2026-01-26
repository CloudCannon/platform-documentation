export const layout = "layouts/reference.njk"
export const date = "git last modified"
export function url(page){
  let u = page.data.url
  u = u.split("/").slice(3)
  return `/developer-reference/${u.join("/")}`
}