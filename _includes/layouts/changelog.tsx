import type { ChangelogYears, Comp, Helpers } from "../../_types.d.ts";

interface Props {
  content: string;
  url: string;
  title: string;
  date: string;
  changelog_years?: () => ChangelogYears;
  comp: Comp;
}

export default function ChangelogLayout(props: Props, helpers: Helpers) {
  const {
    comp,
    content,
    url,
    title,
    date,
    changelog_years,
  } = props;

  const year = helpers.date(date, "yyyy") || "";

  return (
    <div className="l-page" x-init="showmobilenav = true"
      data-pagefind-body
      data-pagefind-weight="0.5"
      data-pagefind-filter="site:Changelog"
      data-pagefind-meta="site:Changelog"
    >
      <comp.Layout.PagefindCategoryMeta category="Changelog" />
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
            items={[
              { label: "Changelog", href: "/documentation/changelog/" },
              { label: year, href: `/documentation/changelog/${year}/` },
            ]}
            helpers={helpers}
          />
          <div>
            <h1 className="l-heading changelog-entry__heading">
              {title}
            </h1>
          </div>
          <p className="changelog-entry__date">
            <comp.RelativeDate date={date} />
          </p>
          <div className="l-copy-page-mobile" data-pagefind-ignore>
            <comp.CopyPageDropdown title={title || ""} url={url} helpers={helpers} />
          </div>
          <comp.Layout.MobileTOC helpers={helpers} />
          <div className="l-content-split" x-data="visibleNavHighlighter">
            <main id="main-content">
              <div
                className="changelog-entry"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </main>
            <aside data-pagefind-ignore className="l-right">
              <comp.CopyPageDropdown title={title || ""} url={url} helpers={helpers} />
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
