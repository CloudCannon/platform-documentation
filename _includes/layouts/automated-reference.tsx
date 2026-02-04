import { formatTitle, parseDocUrl } from "../../_components/utils/index.ts";
import Breadcrumb from "../../_components/Layout/Breadcrumb.tsx";
import MobileTOC from "../../_components/Layout/MobileTOC.tsx";
import NavSidebar from "../../_components/Layout/NavSidebar.tsx";
import DocNav from "../../_components/Reference/DocNav.tsx";
import ReferenceContent, {
  DocNameFull,
  getTocItems,
  TableOfContents,
} from "../../_components/Reference/ReferenceContent.tsx";
import type { SectionId } from "../../_components/Reference/helpers.ts";
import type { DocEntry, Helpers, Page, PageSearch } from "../../_types.d.ts";

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
}

export default function AutomatedReferenceLayout(
  {
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

  const tocItems = getTocItems(entry, section);

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
    <div className="l-page" x-init="showmobilenav = true">
      <div className="l-column">
        <NavSidebar className="developer-reference">
          {ref_nav && search && (
            <DocNav
              ref_nav={ref_nav}
              currentUrl={currentUrl}
              section={section}
              search={search}
              helpers={helpers}
            />
          )}
        </NavSidebar>

        <div className="u-card-box l-content" x-data="visibleNavHighlighter">
          <Breadcrumb items={breadcrumbItems} helpers={helpers} />

          <div
            data-pagefind-body
            data-pagefind-weight="0.1"
            data-pagefind-filter="site:Reference"
            data-pagefind-meta="site:Reference"
          >
            <h1 className="l-heading u-margin-bottom-0">
              <DocNameFull doc={entry} />
            </h1>
          </div>

          <MobileTOC helpers={helpers} listClassName="">
            <TableOfContents items={tocItems} />
          </MobileTOC>

          <div className="l-content-split">
            <main id="main-content">
              <ReferenceContent
                entry={entry}
                currentUrl={currentUrl}
                section={section}
                helpers={helpers}
              />
            </main>

            <aside data-pagefind-ignore className="l-right">
              <div className="l-toc" alpine:scroll="onScroll()">
                <TableOfContents items={tocItems} withHeading />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
