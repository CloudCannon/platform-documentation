import { truncate } from "../../_components/utils/string-util.ts";
import type { ChangelogYears, Comp, Helpers } from "../../_types.d.ts";

interface ChangelogPage {
  url: string;
  content: string;
  page?: {
    data?: {
      title?: string;
      date?: string;
    };
  };
}

interface MonthGroup {
  name: string;
  results?: ChangelogPage[];
}

interface Data {
  year: string;
  months?: MonthGroup[];
  isOldestYear?: boolean;
  isNewestYear?: boolean;
  previousYear?: string;
}

interface Props {
  url: string;
  data?: Data;
  changelog_years?: () => ChangelogYears;
  comp: Comp;
}

export default async function ChangelogCardsLayout(
  props: Props,
  helpers: Helpers,
) {
  const {
    comp,
    url,
    data,
    changelog_years,
  } = props;

  // Pre-render all changelog text content (async)
  const renderedTextByMonth = await Promise.all(
    (data?.months || []).map(async (monthGroup) => {
      return await Promise.all(
        (monthGroup.results || []).map(async (changelog) => {
          const text = await helpers.render_text_only?.(changelog.content);
          return truncate(text || "", 100);
        }),
      );
    }),
  );

  return (
    <div className="l-page" x-init="showmobilenav = true">
      <div className="l-column">
        <comp.Layout.NavSidebar>
          <comp.Nav.ChangeNav
            title="Changelog"
            url={url}
            changelogYears={changelog_years}
          />
        </comp.Layout.NavSidebar>
        <div className="u-card-box l-small-content">
          <comp.Layout.Breadcrumb
            items={[{ label: "Changelog", href: "/documentation/changelog/" }]}
            helpers={helpers}
          />
          <h1 className="l-heading u-margin-bottom-0">
            {data?.year}
          </h1>
          <comp.Layout.MobileTOC helpers={helpers} />
          <div className="l-content-split" x-data="visibleNavHighlighter">
            <main id="main-content">
              {data?.months?.map((monthGroup, mi) => (
                <div key={mi}>
                  <h2 className="changelog-month-heading">{monthGroup.name}</h2>
                  <div className="c-card-container--changelog">
                    {monthGroup.results?.map((changelog, ci) => (
                      <comp.Card.Card
                        key={ci}
                        href={changelog.url}
                        title={changelog.page?.data?.title}
                        date={changelog.page?.data?.date || ""}
                        description={renderedTextByMonth[mi]?.[ci] || ""}
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
                  <p>
                    We began writing changelogs on the 20th of July 2015 and
                    never looked back.
                  </p>
                </div>
              )}
              {data?.isNewestYear && data?.previousYear && (
                <div className="changelog-footer">
                  <p>That's all for {data.year} so far. Stay tuned!</p>
                  <a href={`/documentation/changelog/${data.previousYear}/`}>
                    Catch up on {data.previousYear}
                    <img
                      src={helpers.icon("arrow_forward:outlined", "material")}
                      inline="true"
                    />
                  </a>
                </div>
              )}
              {!data?.isOldestYear && !data?.isNewestYear &&
                data?.previousYear && (
                <div className="changelog-footer">
                  <p>That's a wrap for {data.year}!</p>
                  <a href={`/documentation/changelog/${data.previousYear}/`}>
                    See what we shipped in {data.previousYear}
                    <img
                      src={helpers.icon("arrow_forward:outlined", "material")}
                      inline="true"
                    />
                  </a>
                </div>
              )}
            </main>

            <aside data-pagefind-ignore="" className="l-right">
              <div className="l-toc" {...{ "x-on:scroll.window.throttle.50ms": "onScroll()" }} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
export const title = "Changelog";
export const description = "List of all changes made to the CloudCannon app";
