/**
 * Renders a hidden span with data-pagefind-meta for article_category (e.g. Instructions,
 * Explanation). Used in article layouts so search results show the Diataxis category
 * as the second tag after the content type (User Article / Developer Article).
 */
export default function PagefindArticleCategoryMeta({
  category,
}: {
  category?: string | string[];
}) {
  if (!category) return null;
  const value = Array.isArray(category) ? category.join(", ") : category;
  if (!value.trim()) return null;
  return <span hidden data-pagefind-meta={`article_category:${value}`} />;
}
