import RefNavItem from "./RefNavItem.tsx";
import { getDisplayName } from "./helpers.ts";
import NavWrapper from "../Nav/NavWrapper.tsx";
import NavHeading from "../Nav/NavHeading.tsx";
import ScrollGradient from "../Nav/ScrollGradient.tsx";
import type {
  ContentNavBlock,
  ContentNavigation,
  ContentNavItem,
  DocEntry,
  Helpers,
  PageSearch,
} from "../../_types.d.ts";

// Get explicit sectionPath for each block based on data_source
function getSectionPath(block: ContentNavBlock): string {
  if (block.data_source === "routing") {
    return "/documentation/developer-reference/routing-file/";
  }
  if (block.data_source === "initial-site-settings") {
    return "/documentation/developer-reference/initial-site-settings-file/";
  }
  // Configuration File has no data_source
  return "/documentation/developer-reference/configuration-file/";
}

// Check if a block should be active based on currentDoc's gid or URL
function isBlockActive(
  block: ContentNavBlock,
  currentDoc?: { gid?: string },
  pageUuid?: string,
  currentUrl?: string,
): boolean {
  // Check _bubbled for static articles (like home pages)
  if (pageUuid && block._bubbled?.includes(pageUuid)) {
    return true;
  }

  // For configuration_types_documentation blocks, check URL-based matching
  if (block.configuration_types_documentation && currentUrl) {
    const sectionPath = getSectionPath(block);
    // Check if current URL starts with this section's path
    if (currentUrl.startsWith(sectionPath)) {
      return true;
    }
  }

  // Check if currentDoc belongs to this specific section (for data-driven pages)
  if (currentDoc?.gid && block.configuration_types_documentation) {
    if (block.data_source === "routing") {
      return currentDoc.gid.startsWith("routing-file.");
    }
    if (block.data_source === "initial-site-settings") {
      return currentDoc.gid.startsWith("initial-site-settings-file.");
    }
    // Configuration File (no data_source) - check it's not from other sections
    if (!block.data_source) {
      return !currentDoc.gid.startsWith("routing-file.") &&
        !currentDoc.gid.startsWith("initial-site-settings-file.");
    }
  }
  return false;
}

interface RefNavListProps {
  currentDoc?: unknown;
  currentUrl?: string;
  items?: DocEntry[];
  sectionPath?: string;
}

function RefNavList({
  currentDoc,
  currentUrl,
  items,
  sectionPath,
}: RefNavListProps) {
  const navItems = (items || [])
    .filter((item) => item.documentation?.show_in_navigation)
    .sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));

  return (
    <ol className="t-docs-nav__sub-list">
      {navItems.map((item) => (
        <RefNavItem
          key={item.gid}
          entry={item}
          currentDoc={currentDoc}
          currentUrl={currentUrl}
          sectionPath={sectionPath}
        />
      ))}
    </ol>
  );
}

interface ArticleGroupProps {
  block: ContentNavItem;
  page?: {
    data?: {
      _uuid?: string;
      url?: string;
    };
  };
  search: PageSearch;
  helpers: Helpers;
}

function ArticleGroup({ block, page, search, helpers }: ArticleGroupProps) {
  if (!block.items?.length) return null;

  return (
    <ol className="t-docs-nav__sub-list">
      {block.items.map((item, idx) => {
        if (item._type === "group") {
          const isActive = page?.data?._uuid &&
            item._bubbled?.includes(page.data._uuid);
          return (
            <li key={item.name || idx}>
              <details
                open={isActive || undefined}
                className={isActive ? "nav-open is-active" : undefined}
              >
                <summary className="t-docs-nav__sub-list__heading">
                  {item.name}
                  <img
                    src={helpers.icon("chevron_right:outlined", "material")}
                    inline="true"
                  />
                </summary>
                <ArticleGroup
                  block={item}
                  page={page}
                  search={search}
                  helpers={helpers}
                />
              </details>
            </li>
          );
        } else {
          return item.articles?.map((articleUuid) => {
            const articlePage = search.page(`_uuid=${articleUuid}`);
            if (!articlePage) return null;

            const isCurrent = articlePage.url === page?.data?.url;
            return (
              <li key={articleUuid}>
                <a
                  className="t-docs-nav__sub-list__article"
                  href={articlePage.url}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {articlePage.page?.data?.details?.title || articlePage.title}
                </a>
              </li>
            );
          });
        }
      })}
    </ol>
  );
}

interface DocNavProps {
  navigation: ContentNavigation;
  currentDoc?: {
    gid?: string;
  };
  currentUrl: string;
  items?: DocEntry[];
  routing_docs?: DocEntry[];
  initial_site_settings_docs?: DocEntry[];
  page?: {
    data?: {
      _uuid?: string;
      url?: string;
    };
  };
  search: PageSearch;
  helpers: Helpers;
}

export default function DocNav(
  {
    navigation,
    currentDoc,
    currentUrl,
    items,
    routing_docs,
    initial_site_settings_docs,
    page,
    search,
    helpers,
  }: DocNavProps,
) {
  if (!navigation) {
    return <nav id="t-docs-nav" className="t-docs-nav">No navigation data</nav>;
  }

  // Always find the developer-reference home page, not a section home
  const indexPage = search.page("url=/documentation/developer-reference/");
  const headings = navigation.headings || [];
  const pageUuid = page?.data?._uuid;

  // Use URL comparison for home link instead of UUID (data-driven pages don't have pageUuid)
  const isHomeActive = currentUrl === indexPage?.url || 
    currentUrl === indexPage?.url?.replace(/\/$/, "");


  return (
    <NavWrapper>
      <ScrollGradient position="top" />
      <NavHeading title={navigation.title} />

      <ol
        className="t-docs-nav__main-list"
        x-init={`
          new ResizeObserver((entries) => {
            height = $refs.navParent.getBoundingClientRect().height;
            scrollHeight = $refs.navParent.scrollHeight;
          }).observe($el);
          $nextTick(() => {
            const active = $el.querySelector('[aria-current=page]');
            if (active) active.scrollIntoView({ block: 'center', behavior: 'instant', container: 'nearest' });
          });
        `}
      >
        {indexPage && (
          <li className="t-docs-nav__main-list__item">
            <a
              className={`t-docs-nav__main-list__item__heading-group t-docs-nav__sub-list__article ${
                isHomeActive ? "is-active" : ""
              }`}
              href={indexPage.url}
              aria-current={isHomeActive ? "page" : undefined}
            >
              <img
                src={helpers.icon("home:outlined", "material")}
                inline="true"
              />
              <span className="t-docs-nav__main-list__item__heading">
                {indexPage.attrs?.details?.title || indexPage.title || "Home"}
              </span>
            </a>
          </li>
        )}

        {headings.map((block, idx) => {
          const isActive = isBlockActive(block, currentDoc, pageUuid, currentUrl);
          const blockSectionPath = getSectionPath(block);

          // Get section home page from block.items if available
          const sectionHomeUuid = block.items?.[0]?.articles?.[0];
          const sectionHomePage = sectionHomeUuid
            ? search.page(`_uuid=${sectionHomeUuid}`)
            : null;

          // Use URL comparison for section home instead of UUID
          const isSectionHomeActive = sectionHomePage && 
            (currentUrl === sectionHomePage.url || 
             currentUrl === sectionHomePage.url?.replace(/\/$/, ""));


          return (
            <li
              key={block._uuid || idx}
              className="t-docs-nav__main-list__item"
            >
              <details
                {...(isActive ? { open: true } : {})}
                className={isActive ? "is-active" : ""}
              >
                {!block.heading_hidden && (
                  <summary
                    className={`t-docs-nav__main-list__item__heading-group ${
                      isActive ? "is-active" : ""
                    }`}
                  >
                    {block.icon && (
                      <img
                        src={helpers.icon(`${block.icon}:outlined`, "material")}
                        inline="true"
                      />
                    )}
                    <span className="t-docs-nav__main-list__item__heading">
                      {block.heading}
                    </span>
                    <img
                      src={helpers.icon(
                        "arrow_forward_ios:outlined",
                        "material",
                      )}
                      inline="true"
                    />
                  </summary>
                )}
                {block.configuration_types_documentation
                  ? (
                    <ol className="t-docs-nav__sub-list">
                      {/* Section home page link */}
                      {sectionHomePage && (
                        <li>
                          <a
                            className="t-docs-nav__sub-list__article"
                            href={sectionHomePage.url}
                            aria-current={isSectionHomeActive ? "page" : undefined}
                          >
                            {sectionHomePage.attrs?.details?.title ||
                              sectionHomePage.title ||
                              "Overview"}
                          </a>
                        </li>
                      )}
                      {/* Reference items */}
                      {(block.data_source === "routing"
                        ? routing_docs
                        : block.data_source === "initial-site-settings"
                        ? initial_site_settings_docs
                        : items
                      )
                        ?.filter((item) => item.documentation?.show_in_navigation && item.url !== "/")
                        .sort((a, b) =>
                          getDisplayName(a).localeCompare(getDisplayName(b))
                        )
                        .map((item) => (
                          <RefNavItem
                            key={item.gid}
                            entry={item}
                            currentDoc={currentDoc}
                            currentUrl={currentUrl}
                            sectionPath={blockSectionPath}
                          />
                        ))}
                    </ol>
                  )
                  : (
                    <ArticleGroup
                      block={block}
                      page={page}
                      search={search}
                      helpers={helpers}
                    />
                  )}
              </details>
            </li>
          );
        })}
      </ol>
      <ScrollGradient position="bottom" />
    </NavWrapper>
  );
}

export { ArticleGroup, RefNavList };
