import { formatTitle, parseDocUrl } from "../../_components/utils/index.ts";
import Breadcrumb from "../../_components/Layout/Breadcrumb.tsx";
import MobileTOC from "../../_components/Layout/MobileTOC.tsx";
import NavSidebar from "../../_components/Layout/NavSidebar.tsx";
import DocNav from "../../_components/Reference/DocNav.tsx";
import ReferenceContent, {
  DocName,
  getTocItems,
  TableOfContents,
} from "../../_components/Reference/ReferenceContent.tsx";
import type {
  ContentNavigation,
  DocEntry,
  Helpers,
  Page,
  PageSearch,
} from "../../_types.d.ts";

interface Props {
  entry?: DocEntry;
  page?: Page;
  navigation?: Record<string, ContentNavigation>;
  full_docs?: DocEntry[];
  routing_docs?: DocEntry[];
  initial_site_settings_docs?: DocEntry[];
  url?: string;
  search?: PageSearch;
}

export default function AutomatedReferenceLayout(
  {
    entry,
    page,
    navigation,
    full_docs,
    routing_docs,
    initial_site_settings_docs,
    url,
    search,
  }: Props,
  helpers: Helpers,
) {
  if (!entry) {
    return <div>Error: No entry provided</div>;
  }

  const currentUrl = page?.data?.url || url || "";

  const { navKey: sectionKey } = parseDocUrl(currentUrl);
  const navData = navigation?.[sectionKey];

  const tocItems = getTocItems(entry);

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
          {navData && search && (
            <DocNav
              navigation={navData}
              currentDoc={entry}
              currentUrl={currentUrl}
              items={full_docs}
              routing_docs={routing_docs}
              initial_site_settings_docs={initial_site_settings_docs}
              page={page}
              search={search}
              helpers={helpers}
            />
          )}
        </NavSidebar>

        <div className="u-card-box l-content" x-data="visibleNavHighlighter">
          <Breadcrumb items={breadcrumbItems} helpers={helpers} />

          <h1 data-pagefind-body className="l-heading u-margin-bottom-0">
            <DocName doc={entry} />
          </h1>

          <MobileTOC helpers={helpers} listClassName="">
            <TableOfContents items={tocItems} />
          </MobileTOC>

          <div
            data-pagefind-body
            data-pagefind-filter="site:Documentation"
            data-pagefind-meta="site:Documentation"
            className="l-content-split"
          >
            <main id="main-content">
              <ReferenceContent
                entry={entry}
                currentUrl={currentUrl}
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
