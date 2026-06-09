import { formatTitle } from "../../_components/utils/string-util.ts";
import { parseDocUrl } from "../../_components/utils/url-util.ts";
import type { SectionId } from "../../_components/Reference/helpers.ts";
import type {
  Comp,
  DocEntry,
  Helpers,
  Page,
  PageSearch,
} from "../../_types.d.ts";

// Precompiled reference navigation types (matches _config.ts)
interface RefNavItem {
  url: string;
  name: string;
  gid: string;
}

interface RefNavSection {
  id: SectionId;
  heading: string;
  icon: string;
  basePath: string;
  items: RefNavItem[];
}

interface Props {
  entry?: DocEntry;
  section: SectionId;
  page?: Page;
  ref_nav?: RefNavSection[];
  url?: string;
  search?: PageSearch;
  comp: Comp;
}

export default function AutomatedReferenceLayout(
  {
    comp,
    entry,
    section,
    page,
    ref_nav,
    url,
    search,
  }: Props,
  helpers: Helpers,
) {
  if (!entry) {
    return <div>Error: No entry provided</div>;
  }

  if (!section) {
    return <div>Error: No section provided</div>;
  }

  const currentUrl = page?.data?.url || url || "";

  // Build breadcrumb items dynamically from current URL
  // URL structure: /documentation/developer-reference/{section}/{rest}/
  const { urlParts } = parseDocUrl(currentUrl);
  const sectionSlug = urlParts[1]; // e.g., "configuration-file" (urlParts[0] is "developer-reference")
  const breadcrumbItems = [
    {
      label: "Developer Reference",
      href: "/documentation/developer-reference/",
    },
  ];
  if (sectionSlug) {
    breadcrumbItems.push({
      label: formatTitle(sectionSlug),
      href: `/documentation/developer-reference/${sectionSlug}/`,
    });
  }

  return (
    <div className="l-page"
      x-init="showmobilenav = true"
      data-pagefind-body
      data-pagefind-weight="0.1"
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
              section={section}
              search={search}
              helpers={helpers}
            />
          )}
        </comp.Layout.NavSidebar>

        <div className="u-card-box l-content" x-data="visibleNavHighlighter">
          <comp.Layout.Breadcrumb items={breadcrumbItems} helpers={helpers} />

          <div>
            <h1 className="l-heading u-margin-bottom-0">
              <comp.Reference.DocNameFull doc={entry} />
            </h1>
          </div>

          <div className="l-copy-page-mobile" data-pagefind-ignore>
            <comp.CopyPageDropdown title={entry.title || ""} url={currentUrl} helpers={helpers} />
          </div>
          <comp.Layout.MobileTOC helpers={helpers} listClassName="">
            <comp.Reference.TableOfContents entry={entry} section={section} />
          </comp.Layout.MobileTOC>

          <div className="l-content-split">
            <main id="main-content">
              <comp.Reference.ReferenceContent
                entry={entry}
                currentUrl={currentUrl}
                section={section}
                helpers={helpers}
              />
            </main>

            <aside data-pagefind-ignore className="l-right">
              <comp.CopyPageDropdown title={entry.title || ""} url={currentUrl} helpers={helpers} />
              <div className="l-toc" {...{ "x-on:scroll.window.throttle.50ms": "onScroll()" }}>
                <comp.Reference.TableOfContents entry={entry} section={section} withHeading />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
