import DocNav from '../../_components/Reference/DocNav.jsx';
import MobileTOC from '../../_components/Layout/MobileTOC.jsx';
import NavSidebar from '../../_components/Layout/NavSidebar.jsx';
import { parseDocUrl, formatTitle } from '../../_components/utils/index.js';

export default function ReferenceHomeLayout({ content, details, date, page, navigation, full_docs, url, search }, helpers) {
    const currentUrl = page?.data?.url || url || '';
    const { navKey: sectionKey } = parseDocUrl(currentUrl);
    const navData = navigation?.[sectionKey];
    const sectionName = sectionKey?.replace(/-/g, ' ') || '';
    
    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <NavSidebar className="developer-reference">
                    <DocNav 
                        navigation={navData}
                        currentDoc={null}
                        currentUrl={currentUrl}
                        items={full_docs}
                        page={page}
                        search={search}
                        helpers={helpers}
                    />
                </NavSidebar>
                
                <div className="u-card-box l-content" x-data="$visibleNavHighlighter">
                    <div className="l-breadcrumb">
                        <span style={{ textTransform: 'capitalize' }}>{sectionName}</span>
                        <img src={helpers.icon('arrow_forward_ios:outlined', 'material')} inline="true" />
                        <span>{details?.title}</span>
                    </div>
                    
                    <h1 
                        data-pagefind-body 
                        className="l-heading u-margin-bottom-0"
                        data-editable="text"
                        data-prop="details.title"
                    >
                        {details?.title}
                    </h1>
                    
                    <p className="l-subheading">
                        Last modified: {helpers.date(date, 'HUMAN_DATE')}
                    </p>
                    
                    <MobileTOC helpers={helpers} />
                    
                    <div 
                        data-pagefind-body 
                        data-pagefind-filter="site:Documentation" 
                        data-pagefind-meta="site:Documentation" 
                        className="l-content-split"
                    >
                        <main>
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        </main>
                        
                        <aside data-pagefind-ignore className="l-right">
                            <div className="l-toc" alpine:scroll="onScroll()" />
                        </aside>
                    </div>
                    
                    <RelatedArticles details={details} search={search} helpers={helpers} />
                </div>
            </div>
        </div>
    );
}

function RelatedArticles({ details, search, helpers }) {
    const articles = details?.related_articles;
    if (!articles?.length) return null;
    
    return (
        <>
            <h2>Related Resources</h2>
            <div>
                <ul 
                    className="c-related-article-container" 
                    data-editable="array" 
                    data-prop="details.related_articles"
                >
                    {articles.map(related => {
                        const article = search?.page?.(`_uuid=${related.item}`);
                        if (!article) return null;
                        
                        return (
                            <li key={related.item} data-editable="array-item">
                                <a className="c-related-article" href={article.url}>
                                    <h3 className="c-related-article__title">
                                        {article.details?.title}
                                    </h3>
                                    {article.details?.description && (
                                        <p className="c-related-article__desc">
                                            {article.details.description}
                                        </p>
                                    )}
                                    <div className="c-related-article__footer">
                                        {article.details?.category && (
                                            <div className="c-related-article__footer--category">
                                                {article.details.category}
                                            </div>
                                        )}
                                        <img src={helpers.icon('arrow_forward:outlined', 'material')} inline="true" />
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

export const layout = "layouts/base.jsx";
