import PrevNext from '../../_components/Content/PrevNext.jsx';
import MobileTOC from '../../_components/Layout/MobileTOC.jsx';

export default function GuideLayout(props, helpers) {
    const { 
        content, 
        url, 
        page,
        details,
        guide_title,
        guide_icon,
        search
    } = props;

    const guideParts = url.split("/");
    const guideId = [guideParts[1], guideParts[2], guideParts[3]].join("/");
    const guideArticles = search.pages(`url^=/${guideId}`, "details.order") || [];
    const totalPages = guideArticles.length;
    
    let currentIndex = 0;
    guideArticles.forEach((data, i) => {
        if (data.url === url) {
            currentIndex = i;
        }
    });
    
    const prev = guideArticles[currentIndex - 1];
    const next = guideArticles[currentIndex + 1];

    return (
        <div className="l-page">
            <div className="l-column">
                <aside className="l-left" x-data="{ more: true }">
                    <nav id="t-docs-nav" className="t-docs-nav" alpine:class="isPageNavOpen ? 't-docs-nav t-docs-nav--open' : 't-docs-nav'">
                        <div className="t-docs-nav__heading">
                            {guide_icon && <img src={guide_icon} width="50" height="50" />}
                            <h2 data-pagefind-meta="guide_title">{guide_title}</h2>

                            <button className="t-docs-nav__control" x-on:click="isPageNavOpen = true; $focusNav(true);" x-show="!isPageNavOpen" aria-label="Open guide menu">
                                <img src="/assets/img/expand.svg" inline="true" />
                            </button>
                            <button className="t-docs-nav__control" x-on:click="isPageNavOpen = false; $focusNav(false);" x-show="isPageNavOpen" aria-label="Close guide menu">
                                <img src="/assets/img/close.svg" inline="true" />
                            </button>
                        </div>
                        <ol className="t-docs-nav__main-list">
                            <li className="t-docs-nav__main-list__item guide">
                                <ol className="t-docs-nav__sub-list">
                                    {guideArticles.map((data, i) => {
                                        const isCurrent = data.url === url;
                                        const isCompleted = !isCurrent && data.details?.order < page?.data?.details?.order;
                                        let completeClass = '';
                                        if (isCurrent) {
                                            completeClass = 'current-guide';
                                        } else if (isCompleted) {
                                            completeClass = 'guide-complete';
                                        }

                                        return (
                                            <li key={i}>
                                                {data.start_nav_group && (
                                                    <span className="t-docs-nav__main-list__item__heading">{data.start_nav_group}</span>
                                                )}
                                                <a 
                                                    className="t-docs-nav__sub-list__article guide"
                                                    {...(isCurrent ? { 'aria-current': 'page' } : {})}
                                                    href={data.url}
                                                >
                                                    <div className="t-docs-nav__sub-list__connector-group">
                                                        <span className={`t-docs-nav__sub-list__index ${completeClass}`}>
                                                            {isCompleted ? (
                                                                <img src={helpers.icon("check:outlined", "material")} inline="true" />
                                                            ) : data.details?.order}
                                                        </span>
                                                        {data.details?.order < guideArticles.length && (
                                                            <span className={`t-docs-nav__sub-list__connector ${completeClass}`} />
                                                        )}
                                                    </div>
                                                    <div className="guide-title">{data.details?.title}</div>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </li>
                        </ol>
                        <div x-intersect="more = false" x-intersect:leave="more = true" />
                    </nav>
                </aside>
                <div className="u-card-box l-content" x-data="$visibleNavHighlighter">
                    <h1 data-pagefind-body="" className="l-heading u-margin-bottom-0">{details?.title}</h1>
                    <p data-pagefind-body="" className="l-subheading">{details?.description}</p>
                    <MobileTOC helpers={helpers} />
                    <div data-pagefind-body="" data-pagefind-filter="site:Guides" data-pagefind-meta="site:Guides" className="l-content-split">
                        <main dangerouslySetInnerHTML={{ __html: content }} />
                        <aside data-pagefind-ignore="" className="l-right">
                            <div className="l-toc" alpine:scroll="onScroll()" />
                        </aside>
                    </div>

                    <PrevNext 
                        prev={prev}
                        next={next}
                        guideIcon={guide_icon}
                        guideTitle={guide_title}
                        details={details}
                        totalPages={totalPages}
                        helpers={helpers}
                    />
                </div>
            </div>
        </div>
    );
}

export const layout = "layouts/base.jsx";
