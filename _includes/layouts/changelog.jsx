import ChangeNav from '../../_components/Nav/ChangeNav.jsx';

export default function ChangelogLayout(props, helpers) {
    const { 
        content, 
        url, 
        title,
        date,
        changelog_years
    } = props;

    const year = helpers.date(date, 'yyyy');

    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <aside className="l-left" x-data="{ more: true }">
                    <ChangeNav 
                        title="Changelog"
                        url={url}
                        changelogYears={changelog_years}
                    />
                    <template x-teleport="#mobile-docnav">
                        <ChangeNav 
                            title="Changelog"
                            url={url}
                            changelogYears={changelog_years}
                        />
                    </template>
                </aside>
                <div className="u-card-box l-small-content">
                    <div className="l-breadcrumb">
                        <a href="/documentation/changelog/">Changelog</a>
                        <span className="l-breadcrumb__separator">/</span>
                        <a href={`/documentation/changelog/${year}/`}>{year}</a>
                    </div>
                    <h1 data-pagefind-body="" className="l-heading changelog-entry__heading">{title}</h1>
                    <p className="changelog-entry__date">{helpers.DATE_TO_NOW(date)}</p>
                    <div className="l-toc-mobile" x-data="{toc_open:false}" alpine:click="toc_open = !toc_open">
                        <h3 alpine:class="toc_open ? 'open' : ''">
                            Table of contents 
                            <img src={helpers.icon("arrow_forward_ios:outlined", "material")} inline="true" />
                        </h3>
                        <div className="l-toc__list" alpine:class="toc_open ? 'open' : ''" />
                    </div>
                    <div className="l-content-split" x-data="$visibleNavHighlighter">
                        <main data-pagefind-body="" data-pagefind-filter="site:Changelog" data-pagefind-meta="site:Changelog">
                            <div className="changelog-entry" dangerouslySetInnerHTML={{ __html: content }} />
                        </main>
                        <aside data-pagefind-ignore="" className="l-right">
                            <div className="l-toc-changelog-list" alpine:scroll="onScroll()" />
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const layout = "layouts/base.jsx";
