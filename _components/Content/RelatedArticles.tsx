import Card from '../Card/Card.tsx';
import type { Helpers, Details, PageSearch } from '../../_types.d.ts';

interface RelatedArticlesProps {
    details?: Details;
    search: PageSearch;
    helpers: Helpers;
}

export default function RelatedArticles({ details, search, helpers }: RelatedArticlesProps) {
    if (!details?.related_articles?.length) return null;
    
    return (
        <>
            <h2>Related Resources</h2>
            <div>
                <ul className="c-card-container--related" data-editable="array" data-prop="details.related_articles">
                    {details.related_articles.map((relatedArticle, i) => {
                        const article = search.page(`_uuid=${relatedArticle.item}`);
                        if (!article) return null;
                        
                        return (
                            <li key={i} data-editable="array-item">
                                <Card
                                    href={article.url}
                                    title={article.details?.title}
                                    description={article.details?.description}
                                    category={article.details?.category}
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
