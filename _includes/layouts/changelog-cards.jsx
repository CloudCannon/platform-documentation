import ChangeNav from '../../_components/Nav/ChangeNav.jsx';
import MobileTOC from '../../_components/Layout/MobileTOC.jsx';
import NavSidebar from '../../_components/Layout/NavSidebar.jsx';
import Card from '../../_components/Card/Card.jsx';
import { truncate } from '../../_components/utils/index.js';

export default async function ChangelogCardsLayout(props, helpers) {
    const { 
        url, 
        data,
        changelog_years
    } = props;

    // Pre-render all changelog text content (async)
    const renderedTextByMonth = await Promise.all(
        (data?.months || []).map(async (monthGroup) => {
            return await Promise.all(
                (monthGroup.results || []).map(async (changelog) => {
                    const text = await helpers.render_text_only?.(changelog.content);
                    return truncate(text || '', 100);
                })
            );
        })
    );

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
                    <div className="l-breadcrumb">Changelog</div>
                    <h1 className="l-heading u-margin-bottom-0">
                        {data?.year}
                    </h1>
                    <MobileTOC helpers={helpers} />
                    <div className="l-content-split" x-data="$visibleNavHighlighter">
                        <main>
                            {data?.months?.map((monthGroup, mi) => (
                                <div key={mi}>
                                    <h2 className="changelog-month-heading">{monthGroup.name}</h2>
                                    <div className="c-card-container--changelog">
                                        {monthGroup.results?.map((changelog, ci) => (
                                            <Card
                                                key={ci}
                                                href={changelog.url}
                                                title={changelog.page?.data?.title}
                                                date={helpers.DATE_TO_NOW(changelog.page?.data?.date)}
                                                description={renderedTextByMonth[mi]?.[ci] || ''}
                                                variant="changelog"
                                                helpers={helpers}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {data?.isOldestYear && (
                                <div className="changelog-footer changelog-footer--origin">
                                    <p>Everything before this point is lost to time.</p>
                                    <p>We began writing changelogs on the 20th of July 2015 and never looked back.</p>
                                </div>
                            )}
                            {data?.isNewestYear && data?.previousYear && (
                                <div className="changelog-footer">
                                    <p>That's all for {data.year} so far. Stay tuned!</p>
                                    <a href={`/documentation/changelog/${data.previousYear}/`}>
                                        Catch up on {data.previousYear} 
                                        <img src={helpers.icon("arrow_forward:outlined", "material")} inline="true" />
                                    </a>
                                </div>
                            )}
                            {!data?.isOldestYear && !data?.isNewestYear && data?.previousYear && (
                                <div className="changelog-footer">
                                    <p>That's a wrap for {data.year}!</p>
                                    <a href={`/documentation/changelog/${data.previousYear}/`}>
                                        See what we shipped in {data.previousYear} 
                                        <img src={helpers.icon("arrow_forward:outlined", "material")} inline="true" />
                                    </a>
                                </div>
                            )}
                        </main>

                        <aside data-pagefind-ignore="" className="l-right">
                            <div className="l-toc" alpine:scroll="onScroll()" />
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const layout = "layouts/base.jsx";
export const title = 'Changelog';
export const description = 'List of all changes made to the CloudCannon app';
