import DocNav from '../../_components/Nav/DocNav.jsx';
import RelatedArticles from '../../_components/Content/RelatedArticles.jsx';
import MobileTOC from '../../_components/Layout/MobileTOC.jsx';
import NavSidebar from '../../_components/Layout/NavSidebar.jsx';
import { parseDocUrl, formatTitle } from '../../_components/utils/index.js';

export default function ArticleLayout(props, helpers) {
    const { 
        content, 
        url, 
        page, 
        navigation, 
        details, 
        date,
        search
    } = props;

    const { navKey } = parseDocUrl(url);
    const navData = navigation?.[navKey];

    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <NavSidebar>
                    {navData && (
                        <DocNav 
                            navigation={navData}
                            url={url}
                            page={page}
                            search={search}
                            helpers={helpers}
                            getIndexPage={helpers.get_index_page}
                            bubbleUpNav={helpers.bubble_up_nav}
                        />
                    )}
                </NavSidebar>
                <div className="u-card-box l-content" x-data="$visibleNavHighlighter">
                    <div className="l-breadcrumb">
                        <a href={`/documentation/${navKey}/`}>{formatTitle(navKey)}</a>
                    </div>
                    <h1 data-pagefind-body="" className="l-heading u-margin-bottom-0" data-editable="text" data-prop="details.title">
                        {details?.title}
                    </h1>
                    <p className="l-subheading">
                        Last modified: {helpers.date(date, 'HUMAN_DATE')}
                    </p>
                    <MobileTOC helpers={helpers} />
                    <div data-pagefind-body="" data-pagefind-filter="site:Documentation" data-pagefind-meta="site:Documentation" className="l-content-split">
                        <main dangerouslySetInnerHTML={{ __html: content }} />
                        <aside data-pagefind-ignore="" className="l-right">
                            <div className="l-toc" alpine:scroll="onScroll()" />
                        </aside>
                    </div>

                    <RelatedArticles details={details} search={search} helpers={helpers} />
                </div>
            </div>
        </div>
    );
}

export const layout = "layouts/base.jsx";
