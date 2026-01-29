import DocNav from '../../_components/Reference/DocNav.tsx';
import MobileTOC from '../../_components/Layout/MobileTOC.tsx';
import NavSidebar from '../../_components/Layout/NavSidebar.tsx';
import Card from '../../_components/Card/Card.tsx';
import { parseDocUrl } from '../../_components/utils/index.ts';
import type { Helpers, Details, Page, PageSearch, ContentNavigation, DocEntry } from '../../_types.d.ts';

interface Props {
    content: string;
    details?: Details;
    date: string;
    page?: Page;
    navigation?: Record<string, ContentNavigation>;
    full_docs?: DocEntry[];
    url?: string;
    search?: PageSearch;
}

interface RelatedArticlesProps {
    details?: Details;
    search?: PageSearch;
    helpers: Helpers;
}

function RelatedArticles({ details, search, helpers }: RelatedArticlesProps) {
    const articles = details?.related_articles;
    if (!articles?.length || !search) return null;
    
    return (
        <>
            <h2>Related Resources</h2>
            <div>
                <ul 
                    className="c-card-container--related" 
                    data-editable="array" 
                    data-prop="details.related_articles"
                >
                    {articles.map(related => {
                        const article = search.page(`_uuid=${related.item}`);
                        if (!article) return null;
                        
                        return (
                            <li key={related.item} data-editable="array-item">
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

export default function ReferenceHomeLayout({ content, details, date, page, navigation, full_docs, url, search }: Props, helpers: Helpers) {
    const currentUrl = page?.data?.url || url || '';
    const { navKey: sectionKey } = parseDocUrl(currentUrl);
    const navData = navigation?.[sectionKey];
    const sectionName = sectionKey?.replace(/-/g, ' ') || '';
    
    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <NavSidebar className="developer-reference">
                    {navData && search && (
                        <DocNav 
                            navigation={navData}
                            currentDoc={undefined}
                            currentUrl={currentUrl}
                            items={full_docs}
                            page={page}
                            search={search}
                            helpers={helpers}
                        />
                    )}
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
                        <main id="main-content">
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

export const layout = "layouts/base.tsx";
