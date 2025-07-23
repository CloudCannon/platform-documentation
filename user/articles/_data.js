export const layout = "layouts/article.njk"
export const date = "git last modified"
export function url(page) {
  let u = page.data.url
  u = u.split("/").slice(1)
  u = `${u[0]}-${u[1]}/${u[2]}`
  console.log(u)
  return `/${u}/`;
}