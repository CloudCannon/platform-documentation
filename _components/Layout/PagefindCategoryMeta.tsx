/**
 * Renders a hidden span with data-pagefind-meta for category, so search results
 * display the content type tag (User Article, Developer Guide, etc.).
 */
export default function PagefindCategoryMeta({ category }: { category: string }) {
  if (!category) return null;
  return <span hidden data-pagefind-meta={`category:${category}`} />;
}
