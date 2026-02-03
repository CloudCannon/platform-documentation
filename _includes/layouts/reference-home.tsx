import DocNav from "../../_components/Reference/DocNav.tsx";
import MobileTOC from "../../_components/Layout/MobileTOC.tsx";
import NavSidebar from "../../_components/Layout/NavSidebar.tsx";
import RelatedArticles from "../../_components/Content/RelatedArticles.tsx";
import PropertiesTable from "../../_components/Reference/PropertiesTable.tsx";
import RefType from "../../_components/Reference/RefType.tsx";
import {
  getTocItems,
  TableOfContents,
} from "../../_components/Reference/ReferenceContent.tsx";
import type { SectionId } from "../../_components/Reference/helpers.ts";
import { slugify } from "../../_components/utils/index.ts";
import type {
  Details,
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
  content: string;
  details?: Details;
  date: string;
  page?: Page;
  ref_nav?: RefNavSection[];
  url?: string;
  search?: PageSearch;
}

export default function ReferenceHomeLayout(
  {
    content,
    details,
    date,
    page,
    ref_nav,
    url,
    search,
  }: Props,
  helpers: Helpers,
) {
  const currentUrl = page?.data?.url || url || "";

  // Check if we're on a specific section home page (not the main developer-reference home)
  const isConfigurationHome = currentUrl.includes("configuration-file");
  const isRoutingHome = currentUrl.includes("routing-file");
  const isISSHome = currentUrl.includes("initial-site-settings-file");
  const isSectionHome = isConfigurationHome || isRoutingHome || isISSHome;

  // Derive section from the current URL (only matters for section home pages)
  let section: SectionId = "type.Configuration";
  if (isRoutingHome) {
    section = "type.Routing";
  } else if (isISSHome) {
    section = "type.InitialSiteSettings";
  }

  // Only get root entry for section home pages, not the main developer-reference home
  let derivedRootEntry: DocEntry | undefined;
  if (isSectionHome) {
    const sectionDocs = globalThis.DOCS?.[section] ?? {};
    derivedRootEntry = Object.values(sectionDocs).find(
      (doc: DocEntry) => doc.gid === section || doc.url === "/",
    );
  }

  // Generate TOC items from the root entry (only for section home pages)
  const tocItems = derivedRootEntry
    ? getTocItems(derivedRootEntry, section)
    : [];

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
          <h1
            data-pagefind-body
            className="l-heading u-margin-bottom-0"
            data-editable="text"
            data-prop="details.title"
          >
            {details?.title}
          </h1>

          <p className="l-subheading">
            Last modified: {helpers.date(date, "HUMAN_DATE")}
          </p>

          <MobileTOC helpers={helpers} listClassName="">
            <TableOfContents items={tocItems} />
          </MobileTOC>

          <div
            data-pagefind-body
            data-pagefind-filter="site:Reference"
            data-pagefind-meta="site:Reference"
            className="l-content-split"
          >
            <main id="main-content">
              <div dangerouslySetInnerHTML={{ __html: content }} />

              {derivedRootEntry && (
                <dl>
                  {derivedRootEntry.description && (
                    <>
                      <dt id="description">Description:</dt>
                      <dd>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: helpers.md(derivedRootEntry.description),
                          }}
                        />
                      </dd>
                    </>
                  )}

                  {derivedRootEntry.type && (
                    <>
                      <dt id="type">Type:</dt>
                      <dd>
                        <RefType
                          doc={derivedRootEntry}
                          currentUrl={currentUrl}
                          section={section}
                        />
                      </dd>
                    </>
                  )}

                  <PropertiesTable
                    entry={derivedRootEntry}
                    currentUrl={currentUrl}
                    section={section}
                    helpers={helpers}
                    withIds
                    slugify={slugify}
                  />
                </dl>
              )}
            </main>

            <aside data-pagefind-ignore className="l-right">
              <div className="l-toc" alpine:scroll="onScroll()">
                <TableOfContents items={tocItems} withHeading />
              </div>
            </aside>
          </div>

          <RelatedArticles
            details={details}
            search={search}
            helpers={helpers}
          />
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
