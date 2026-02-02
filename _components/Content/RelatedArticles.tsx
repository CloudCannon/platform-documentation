import Card from "../Card/Card.tsx";
import { truncate } from "../utils/index.ts";
import type {
  ArticlePage,
  Details,
  Helpers,
  PageSearch,
} from "../../_types.d.ts";

interface RelatedArticlesProps {
  details?: Details;
  search?: PageSearch;
  helpers: Helpers;
}

export default async function RelatedArticles(
  { details, search, helpers }: RelatedArticlesProps,
) {
  if (!details?.related_articles?.length || !search) return null;

  // Filter out invalid entries (e.g., legacy slug strings that haven't been converted to UUID references)
  // Valid entries must be objects with a non-empty string `item` property containing a UUID
  const validRelatedArticles = details.related_articles.filter(
    (relatedArticle): relatedArticle is { item: string; _type?: string } =>
      typeof relatedArticle === "object" &&
      relatedArticle !== null &&
      "item" in relatedArticle &&
      typeof relatedArticle.item === "string" &&
      relatedArticle.item.length > 0,
  );

  if (validRelatedArticles.length === 0) return null;

  // Get all articles and pre-render descriptions for those without details.description
  const articles = validRelatedArticles
    .map((relatedArticle) => search.page(`_uuid=${relatedArticle.item}`))
    .filter((article): article is ArticlePage => article !== null);

  // Don't render the section if no articles were found
  if (articles.length === 0) return null;

  // Pre-render descriptions from content for articles without details.description
  const descriptions = await Promise.all(
    articles.map(async (article) => {
      // Use details.description if available
      if (article.details?.description) {
        return article.details.description;
      }
      // Otherwise, generate from content
      if (article.content && helpers.render_text_only) {
        const text = await helpers.render_text_only(article.content);
        return truncate(text || "", 100);
      }
      return undefined;
    }),
  );

  // Infer content type from URL when details.category is missing
  const getCategory = (article: ArticlePage): string | undefined => {
    if (article.details?.category) {
      return article.details.category;
    }
    // Infer from URL pattern
    const url = article.url || "";
    if (url.includes("/changelog/")) return "Changelog";
    if (url.includes("/guides/")) return "Guide";
    if (url.includes("/reference/")) return "Reference";
    if (url.includes("/articles/")) return "Article";
    return undefined;
  };

  return (
    <>
      <h2>Related Resources</h2>
      <div>
        <ul
          className="c-card-container--related"
          data-editable="array"
          data-prop="details.related_articles"
        >
          {articles.map((article, i) => {
            // Fall back to top-level title for pages without details (e.g., changelogs)
            const title = article.details?.title || article.title;

            return (
              <li key={article.url} data-editable="array-item">
                <Card
                  href={article.url}
                  title={title}
                  description={descriptions[i]}
                  category={getCategory(article)}
                  variant="related"
                  helpers={helpers}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
