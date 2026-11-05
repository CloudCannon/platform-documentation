import type { SectionId } from "../../_components/Reference/helpers.ts";
import type { RefNavSection } from "../../developer/reference/_shared/buildRefNav.ts";
import type { Comp, Helpers, Page, PageSearch } from "../../_types.d.ts";

interface ApiChangelogEntry {
  url: string;
  page?: Page;
}

interface Props {
  content?: string;
  title?: string;
  date?: string;
  url?: string;
  page?: Page;
  ref_nav?: RefNavSection[];
  search?: PageSearch;
  api_changelog_entries?: ApiChangelogEntry[];
  comp: Comp;
}

const LIST_URL = "/documentation/developer-reference/api/changelog/";
const FEED_URL = `${LIST_URL}feed.xml`;

// Renders both an API changelog entry and the API changelog list page. The list
// page passes api_changelog_entries; an entry page renders its own content.
export default async function ApiChangelogLayout(
  {
    comp,
    content,
    title,
    date,
    url,
    page,
    ref_nav,
    search,
    api_changelog_entries,
  }: Props,
  helpers: Helpers,
) {
  const currentUrl = page?.data?.url || url || "";
  const isList = Array.isArray(api_changelog_entries);
  const heading = isList ? "API Changelog" : title || "";

  const renderedEntries = isList
    ? await Promise.all(
      api_changelog_entries.map((entry) =>
        helpers.render_page_content(entry.page)
      ),
    )
    : [];

  const breadcrumbItems = [
    { label: "Developer Reference", href: "/documentation/developer-reference/" },
    { label: "API", href: "/documentation/developer-reference/api/" },
    ...(isList ? [] : [{ label: "API Changelog", href: LIST_URL }]),
  ];

  return (
    <div
      className="l-page"
      x-init="showmobilenav = true"
      data-pagefind-body
      data-pagefind-weight="0.5"
      data-pagefind-filter="site:Reference"
      data-pagefind-meta="site:Reference"
    >
      <comp.Layout.PagefindCategoryMeta category="Developer Reference" />
      <div className="l-column">
        <comp.Layout.NavSidebar className="developer-reference">
          {ref_nav && search && (
            <comp.Reference.DocNav
              ref_nav={ref_nav}
              currentUrl={currentUrl}
              section={"api" as unknown as SectionId}
              search={search}
              helpers={helpers}
            />
          )}
        </comp.Layout.NavSidebar>

        <div className="u-card-box l-small-content">
          <comp.Layout.Breadcrumb items={breadcrumbItems} helpers={helpers} />
          <h1
            className="l-heading u-margin-bottom-0 changelog-entry__heading"
            dangerouslySetInnerHTML={{ __html: helpers.md(heading, true) }}
          />
          {isList
            ? (
              <p className="l-subheading">
                <a href={FEED_URL}>Subscribe with RSS</a>{" "}
                to keep up with changes to the CloudCannon API.
              </p>
            )
            : (
              <p className="changelog-entry__date">
                <comp.RelativeDate date={date || ""} />
              </p>
            )}
          <div className="l-copy-page-mobile" data-pagefind-ignore>
            <comp.CopyPageDropdown title={heading} url={currentUrl} helpers={helpers} />
          </div>
          <comp.Layout.MobileTOC helpers={helpers} />
          <div className="l-content-split" x-data="visibleNavHighlighter">
            <main id="main-content" className={isList ? "changelog-main" : ""}>
              {isList
                ? (
                  <>
                    <comp.Notice info_type="important">
                      <p>
                        <strong>The CloudCannon API is in Public Beta.</strong>
                      </p>
                      <p>
                        The API is available to everyone, but is still in
                        development, so CloudCannon may change it. It is
                        versioned under the <code>/api/v0/</code> path, and
                        while it is on a <code>v0</code> version, endpoints and
                        fields may change or be removed.
                      </p>
                    </comp.Notice>
                    <p>
                      This page lists every change to the endpoints, fields,
                      and behavior of the CloudCannon API, newest first. A
                      deprecated endpoint or field keeps working, and its entry
                      here names the replacement. Deprecated endpoints are also
                      marked in the{" "}
                      <a href="/documentation/developer-reference/api/">
                        API reference
                      </a>.
                    </p>
                    {api_changelog_entries.map((entry, i) => (
                      <div key={entry.url} className="changelog-entry">
                        <h2>
                          <a
                            href={entry.url}
                            dangerouslySetInnerHTML={{
                              __html: helpers.md(
                                String(entry.page?.data?.title || ""),
                                true,
                              ),
                            }}
                          />
                        </h2>
                        <p className="changelog-entry__date">
                          <comp.RelativeDate date={entry.page?.data?.date || ""} />
                        </p>
                        <div
                          dangerouslySetInnerHTML={{ __html: renderedEntries[i] }}
                        />
                        {i < api_changelog_entries.length - 1 && (
                          <div className="c-br" />
                        )}
                      </div>
                    ))}
                  </>
                )
                : (
                  <div
                    className="changelog-entry"
                    dangerouslySetInnerHTML={{ __html: content || "" }}
                  />
                )}
            </main>
            <aside data-pagefind-ignore className="l-right">
              <comp.CopyPageDropdown title={heading} url={currentUrl} helpers={helpers} />
              <div
                className="l-toc-changelog-list"
                {...{ "x-on:scroll.window.throttle.50ms": "onScroll()" }}
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
