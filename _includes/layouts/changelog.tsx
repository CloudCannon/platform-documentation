import ChangeNav from "../../_components/Nav/ChangeNav.tsx";
import Breadcrumb from "../../_components/Layout/Breadcrumb.tsx";
import MobileTOC from "../../_components/Layout/MobileTOC.tsx";
import NavSidebar from "../../_components/Layout/NavSidebar.tsx";
import RelativeDate from "../../_components/RelativeDate.tsx";
import type { ChangelogYears, Helpers } from "../../_types.d.ts";

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
    changelog_years,
  } = props;

  const year = helpers.date(date, "yyyy") || "";

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
          <Breadcrumb
            items={[
              { label: "Changelog", href: "/documentation/changelog/" },
              { label: year, href: `/documentation/changelog/${year}/` },
            ]}
            helpers={helpers}
          />
          <div
            data-pagefind-body
            data-pagefind-weight="0.3"
            data-pagefind-filter="site:Changelog"
            data-pagefind-meta="site:Changelog"
          >
            <h1 className="l-heading changelog-entry__heading">
              {title}
            </h1>
          </div>
          <p className="changelog-entry__date">
            <RelativeDate date={date} />
          </p>
          <MobileTOC helpers={helpers} />
          <div className="l-content-split" x-data="visibleNavHighlighter">
            <main id="main-content">
              <div
                className="changelog-entry"
                dangerouslySetInnerHTML={{ __html: content }}
              />
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
