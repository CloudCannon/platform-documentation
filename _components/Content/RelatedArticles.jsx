export default function RelatedArticles({ details, search, helpers }) {
    if (!details?.related_articles?.length) return null;
    
    return (
        <>
            <h2>Related Resources</h2>
            <div>
                <ul className="c-related-article-container" data-editable="array" data-prop="details.related_articles">
                    {details.related_articles.map((relatedArticle, i) => {
                        const article = search.page(`_uuid=${relatedArticle.item}`);
                        if (!article) return null;
                        
                        return (
                            <li key={i} data-editable="array-item">
                                <a className="c-related-article" href={article.url}>
                                    <h3 className="c-related-article__title">{article.details?.title}</h3>
                                    {article.details?.description && (
                                        <p className="c-related-article__desc">{article.details.description}</p>
                                    )}
                                    <div className="c-related-article__footer">
                                        {article.details?.category && (
                                            <div className="c-related-article__footer--category">{article.details.category}</div>
                                        )}
                                        <img src={helpers.icon("arrow_forward:outlined", "material")} inline="true" />
                                    </div>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}
