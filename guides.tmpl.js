export const layout = "layouts/guides-list.njk";

export default function* ({ search, paginate }) {
  const guideItems = search.pages("_schema=guide-item", "guide_priority=asc")
  const guideIds = [];
  
  guideItems.reduce((memo, guide) => {
    if (!memo[guide.data.guide_id]) {
      memo[guide.data.guide_id] = true;
      guideIds.push(guide.data.guide_id)
    }
    return memo;
  }, {});
  
  const options = {
    url: (n) => n === 1 ? '/guides/' : `/guides/${n}/`,
    size: 10,
  };

  for (const page of paginate(guideIds, options)) {
    yield page;
  }
}