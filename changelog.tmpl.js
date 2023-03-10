export const layout = "layouts/changelog-list.njk";

export default function* ({ search, paginate }) {
  const posts = search.pages("url^=/documentation/changelog/", "date=desc");
  
  const options = {
    url: (n) => n === 1 ? '/changelog/' : `/changelog/page/${n}/`,
    size: 10,
  };

  for (const page of paginate(posts, options)) {
    yield page;
  }
}