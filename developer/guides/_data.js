export default {
  url: (page) => {
    let u = page.data.url
    u = u.split("/").slice(3)
    return `/developer-guides/${u.join("/")}`;
  },
  layout: "layouts/guide.njk"
};