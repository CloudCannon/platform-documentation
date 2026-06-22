import type { SectionId } from "../../_components/Reference/helpers.ts";
import { slugify } from "../../_components/utils/string-util.ts";
import type {
  Comp,
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
  comp: Comp;
}

export default function ReferenceHomeLayout(
  {
    comp,
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

  return (
    <div className="l-page" x-init="showmobilenav = true"
      data-pagefind-body
      data-pagefind-weight="0.1"
      data-pagefind-filter="site:Reference"
      data-pagefind-meta="site:Reference">
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
          <h1
            className="l-heading u-margin-bottom-0"
            data-editable="text"
            data-prop="details.title"
          >
            {details?.title}
          </h1>

          <p className="l-subheading" data-pagefind-ignore>
            Last modified: {helpers.date(date, "HUMAN_DATE")}
          </p>

          <div className="l-copy-page-mobile" data-pagefind-ignore>
            <comp.CopyPageDropdown title={details?.title || ""} url={currentUrl} helpers={helpers} />
          </div>
          <comp.Layout.MobileTOC helpers={helpers} listClassName="">
            <comp.Reference.TableOfContents entry={derivedRootEntry} section={section} />
          </comp.Layout.MobileTOC>

          <div className="l-content-split">
            <main id="main-content">
              <div dangerouslySetInnerHTML={{ __html: content }} />

              {derivedRootEntry && (
                <dl>
                  {derivedRootEntry.description && (
                    <>
                      <dt id="description" data-pagefind-ignore>Description:</dt>
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
                      <dt id="type" data-pagefind-ignore>Type:</dt>
                      <dd data-pagefind-ignore>
                        <comp.Reference.RefType
                          doc={derivedRootEntry}
                          currentUrl={currentUrl}
                          section={section}
                        />
                      </dd>
                    </>
                  )}

                  <comp.Reference.PropertiesTable
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
              <comp.CopyPageDropdown title={details?.title || ""} url={currentUrl} helpers={helpers} />
              <div className="l-toc" {...{ "x-on:scroll.window.throttle.50ms": "onScroll()" }}>
                <comp.Reference.TableOfContents entry={derivedRootEntry} section={section} withHeading />
              </div>
            </aside>
          </div>

          <comp.Content.RelatedArticles
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
