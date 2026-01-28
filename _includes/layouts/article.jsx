import DocNav from '../../_components/Nav/DocNav.jsx';
import RelatedArticles from '../../_components/Content/RelatedArticles.jsx';

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

    const urlPath = url.replace("/documentation/", "");
    const urlParts = urlPath.split("/");
    const navKey = urlParts[0];
    const navData = navigation?.[navKey];

    const formatTitle = (str) => {
        if (!str) return '';
        return str.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <aside className="l-left" x-data="{ more: true }">
                    {navData && (
                        <>
                            <DocNav 
                                navigation={navData}
                                url={url}
                                page={page}
                                search={search}
                                helpers={helpers}
                                getIndexPage={helpers.get_index_page}
                                bubbleUpNav={helpers.bubble_up_nav}
                            />
                            <template x-teleport="#mobile-docnav">
                                <DocNav 
                                    navigation={navData}
                                    url={url}
                                    page={page}
                                    search={search}
                                    helpers={helpers}
                                    getIndexPage={helpers.get_index_page}
                                    bubbleUpNav={helpers.bubble_up_nav}
                                />
                            </template>
                        </>
                    )}
                </aside>
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
                    <div className="l-toc-mobile" x-data="{toc_open:false}" alpine:click="toc_open = !toc_open">
                        <h3 alpine:class="toc_open ? 'open' : ''">
                            Table of contents 
                            <img src={helpers.icon("arrow_forward_ios:outlined", "material")} inline="true" />
                        </h3>
                        <div className="l-toc__list" alpine:class="toc_open ? 'open' : ''" />
                    </div>
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
