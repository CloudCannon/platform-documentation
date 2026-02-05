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
  if (!details?.related_articles?.length || !search) return <div class="c-card-container--bottom-spacing"></div>;

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
  // Try using pages() to search across all collections first (more reliable for cross-collection searches)
  const uuidSet = new Set(validRelatedArticles.map(ra => ra.item));
  
  // Helper function to get UUID from an article
  const getArticleUuid = (article: ArticlePage): string | undefined => {
    return article.page?.data?._uuid || article.attrs?._uuid;
  };
  
  let articlesFound: ArticlePage[] = [];
  
  // Try using pages() to search across all collections if available
  if (search.pages) {
    try {
      const allArticles = search.pages("") || [];
      const articles = allArticles
        .filter((article): article is ArticlePage => {
          if (!article) return false;
          const uuid = getArticleUuid(article);
          return uuid !== undefined && uuidSet.has(uuid);
        })
        .sort((a, b) => {
          // Preserve the order from validRelatedArticles
          const aUuid = getArticleUuid(a);
          const bUuid = getArticleUuid(b);
          const aIndex = aUuid ? validRelatedArticles.findIndex(ra => ra.item === aUuid) : -1;
          const bIndex = bUuid ? validRelatedArticles.findIndex(ra => ra.item === bUuid) : -1;
          return aIndex - bIndex;
        });
      
      if (articles.length > 0) {
        articlesFound = articles;
      }
    } catch (e) {
      // If pages() fails, fall through to individual page() calls
    }
  }
  
  // Fallback to individual page() calls if pages() didn't work or returned empty
  if (articlesFound.length === 0) {
    articlesFound = validRelatedArticles
      .map((relatedArticle) => search.page(`_uuid=${relatedArticle.item}`))
      .filter((article): article is ArticlePage => article !== null);
  }

  // Don't render the section if no articles were found
  if (articlesFound.length === 0) return null;

  // Pre-render descriptions from content for articles without details.description
  const descriptions = await Promise.all(
    articlesFound.map(async (article) => {
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

  // Determine category based on URL path (Developer or User)
  const getCategory = (article: ArticlePage): string | undefined => {
    const url = article.url || "";
    
    // Check for Developer content
    if (url.includes("/developer-articles/") || url.includes("/developer-guides/")) {
      return "Developer Article";
    }
    
    // Check for User content
    if (url.includes("/user-articles/") || url.includes("/user-guides/")) {
      return "User Article";
    }
    
    // Return undefined for other content types (changelog, reference, glossary)
    return undefined;
  };

  return (
    <>
      <h2 data-pagefind-ignore>Related Resources</h2>
      <div data-pagefind-ignore>
        <ul
          className="c-card-container--related"
          data-editable="array"
          data-prop="details.related_articles"
        >
          {articlesFound.map((article, i) => {
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
