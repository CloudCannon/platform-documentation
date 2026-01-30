import ChangeNav from '../../_components/Nav/ChangeNav.tsx';
import MobileTOC from '../../_components/Layout/MobileTOC.tsx';
import NavSidebar from '../../_components/Layout/NavSidebar.tsx';
import RelativeDate from '../../_components/RelativeDate.tsx';
import type { Helpers, ChangelogYears } from '../../_types.d.ts';

interface Props {
    content: string;
    url: string;
    title: string;
    date: string;
    changelog_years?: () => ChangelogYears;
}

export default function ChangelogLayout(props: Props, helpers: Helpers) {
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
                <NavSidebar>
                    <ChangeNav 
                        title="Changelog"
                        url={url}
                        changelogYears={changelog_years}
                    />
                </NavSidebar>
                <div className="u-card-box l-small-content">
                    <div className="l-breadcrumb">
                        <a href="/documentation/changelog/">Changelog</a>
                        <span className="l-breadcrumb__separator">/</span>
                        <a href={`/documentation/changelog/${year}/`}>{year}</a>
                    </div>
                    <h1 data-pagefind-body="" className="l-heading changelog-entry__heading">{title}</h1>
                    <p className="changelog-entry__date"><RelativeDate date={date} /></p>
                    <MobileTOC helpers={helpers} />
                    <div className="l-content-split" x-data="visibleNavHighlighter">
                        <main id="main-content" data-pagefind-body="" data-pagefind-filter="site:Changelog" data-pagefind-meta="site:Changelog">
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

export const layout = "layouts/base.tsx";
