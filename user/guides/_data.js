export default {
  url: (page) => {
    let u = page.data.url
    u = u.split("/").slice(3)
    return `/user-guides/${u.join("/")}`;
  },
};