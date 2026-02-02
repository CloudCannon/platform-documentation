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
import { parseDocUrl, slugify } from "../../_components/utils/index.ts";
import type {
  ContentNavigation,
  Details,
  DocEntry,
  Helpers,
  Page,
  PageSearch,
} from "../../_types.d.ts";

interface Props {
  content: string;
  details?: Details;
  date: string;
  page?: Page;
  navigation?: Record<string, ContentNavigation>;
  full_docs?: DocEntry[];
  routing_docs?: DocEntry[];
  initial_site_settings_docs?: DocEntry[];
  url?: string;
  search?: PageSearch;
  rootEntry?: DocEntry;
}

export default function ReferenceHomeLayout(
  {
    content,
    details,
    date,
    page,
    navigation,
    full_docs,
    routing_docs,
    initial_site_settings_docs,
    url,
    search,
    rootEntry,
  }: Props,
  helpers: Helpers,
) {
  const currentUrl = page?.data?.url || url || "";
  const { navKey: sectionKey } = parseDocUrl(currentUrl);
  const navData = navigation?.[sectionKey];

  // Derive rootEntry from full_docs for configuration-file section if not provided
  const derivedRootEntry = rootEntry || (
    currentUrl.includes("configuration-file")
      ? full_docs?.find((doc) => doc.url === "/")
      : undefined
  );

  // Generate TOC items from the root entry
  const tocItems = derivedRootEntry ? getTocItems(derivedRootEntry) : [];

  return (
    <div className="l-page" x-init="showmobilenav = true">
      <div className="l-column">
        <NavSidebar className="developer-reference">
          {navData && search && (
            <DocNav
              navigation={navData}
              currentDoc={derivedRootEntry}
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
            data-pagefind-filter="site:Documentation"
            data-pagefind-meta="site:Documentation"
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
                        <RefType doc={derivedRootEntry} currentUrl={currentUrl} />
                      </dd>
                    </>
                  )}

                  <PropertiesTable
                    entry={derivedRootEntry}
                    currentUrl={currentUrl}
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
