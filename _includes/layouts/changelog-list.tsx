import ChangeNav from "../../_components/Nav/ChangeNav.tsx";
import MobileTOC from "../../_components/Layout/MobileTOC.tsx";
import NavSidebar from "../../_components/Layout/NavSidebar.tsx";
import RelativeDate from "../../_components/RelativeDate.tsx";
import type { ChangelogYears, Helpers, Page } from "../../_types.d.ts";

interface Changelog {
  url: string;
  page?: Page;
}

interface Data {
  results?: Changelog[];
  newestYear?: string;
}

interface Props {
  url: string;
  data?: Data;
  changelog_years?: () => ChangelogYears;
}

export default async function ChangelogListLayout(
  props: Props,
  helpers: Helpers,
) {
  const {
    url,
    data,
    changelog_years,
  } = props;

  // Pre-render all changelog content (async)
  const renderedContent = await Promise.all(
    (data?.results || []).map(async (changelog) => {
      return await helpers.render_page_content(changelog.page);
    }),
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
          <div className="l-breadcrumb" />
          <h1 className="l-heading u-margin-bottom-0 u-padding-bottom-0">
            Changelog
          </h1>
          <p className="l-subheading">
            <a href="/documentation/changelog/feed.xml">Subscribe with RSS</a>
            {" "}
            to keep up with the latest changes.
          </p>

          <MobileTOC helpers={helpers} />
          <div className="l-content-split" x-data="visibleNavHighlighter">
            <main id="main-content" className="changelog-main">
              {data?.results?.map((changelog, i) => (
                <div key={i} className="changelog-entry">
                  <h2
                    className={i === 0
                      ? "u-margin-top-0 changelog-entry__top-heading"
                      : ""}
                  >
                    <a href={changelog.url}>{changelog.page?.data?.title}</a>
                  </h2>
                  <p className="changelog-entry__date">
                    <RelativeDate date={changelog.page?.data?.date || ""} />
                  </p>
                  <div
                    dangerouslySetInnerHTML={{ __html: renderedContent[i] }}
                  />
                  {i < (data?.results?.length || 0) - 1 && (
                    <div className="c-br" />
                  )}
                </div>
              ))}

              <div className="changelog-footer">
                <p>Want more? We've been busy.</p>
                <a href={`/documentation/changelog/${data?.newestYear}/`}>
                  Browse all of {data?.newestYear}
                  <img
                    src={helpers.icon("arrow_forward:outlined", "material")}
                    inline="true"
                  />
                </a>
              </div>
            </main>

            <aside data-pagefind-ignore="" className="l-right">
              <div
                className="l-toc-changelog-list"
                alpine:scroll="onScroll()"
              />
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
