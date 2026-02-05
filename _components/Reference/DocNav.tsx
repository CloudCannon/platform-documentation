import NavWrapper from "../Nav/NavWrapper.tsx";
import NavHeading from "../Nav/NavHeading.tsx";
// import ScrollGradient from "../Nav/ScrollGradient.tsx";
import type { SectionId } from "./helpers.ts";
import type { Helpers, PageSearch } from "../../_types.d.ts";

// Precompiled reference navigation item (matches _config.ts)
interface RefNavItem {
  url: string;
  name: string;
  useCode: boolean;
  gid: string;
}

// Precompiled reference navigation section (matches _config.ts)
interface RefNavSection {
  id: SectionId;
  heading: string;
  icon: string;
  basePath: string;
  items: RefNavItem[];
}

interface DocNavProps {
  ref_nav: RefNavSection[];
  currentUrl: string;
  section: SectionId;
  search: PageSearch;
  helpers: Helpers;
}

export default function DocNav(
  {
    ref_nav,
    currentUrl,
    section: _section,
    search,
    helpers,
  }: DocNavProps,
) {
  if (!ref_nav?.length) {
    return <nav id="t-docs-nav" className="t-docs-nav">No navigation data</nav>;
  }

  // Normalize URL for comparison (remove trailing slash)
  const normalizedUrl = currentUrl?.replace(/\/$/, "") || "";

  // Find the developer-reference home page
  const indexPage = search.page("url=/documentation/developer-reference/");

  // Find static pages for nav entries
  const schemasPage = search.page(
    "url=/documentation/developer-reference/schemas/",
  );
  const typescriptPage = search.page(
    "url=/documentation/developer-reference/typescript/",
  );
  const permissionsPage = search.page(
    "url=/documentation/developer-reference/permissions/",
  );

  // Build unified nav entries: home link + utility links + sections
  const allEntries: RefNavSection[] = [];

  if (indexPage) {
    allEntries.push({
      id: "home" as SectionId,
      heading: indexPage.attrs?.details?.title || indexPage.title || "Home",
      icon: "home",
      basePath: indexPage.url || "/documentation/developer-reference/",
      items: [], // No items = renders as simple link
    });
  }

  allEntries.push(...ref_nav);

  if (permissionsPage) {
    allEntries.push({
      id: "permissions" as SectionId,
      heading: permissionsPage.attrs?.details?.title || permissionsPage.title ||
        "Permissions",
      icon: "groups",
      basePath: permissionsPage.url ||
        "/documentation/developer-reference/permissions/",
      items: [],
    });
  }

  if (schemasPage) {
    allEntries.push({
      id: "schemas" as SectionId,
      heading: schemasPage.attrs?.details?.title || schemasPage.title ||
        "JSON Schemas",
      icon: "data_object",
      basePath: schemasPage.url ||
        "/documentation/developer-reference/schemas/",
      items: [],
    });
  }

  if (typescriptPage) {
    allEntries.push({
      id: "typescript" as SectionId,
      heading: typescriptPage.attrs?.details?.title || typescriptPage.title ||
        "TypeScript Types",
      icon: "code",
      basePath: typescriptPage.url ||
        "/documentation/developer-reference/typescript/",
      items: [],
    });
  }
  return (
    <NavWrapper>
      {/* <ScrollGradient position="top" /> */}
      <NavHeading title="Developer Reference" />

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
        {allEntries.map((sec) => {
          const normalizedBasePath = sec.basePath.replace(/\/$/, "");
          const isExactMatch = normalizedUrl === normalizedBasePath;
          const isActive = sec.items.length > 0
            ? currentUrl.startsWith(normalizedBasePath)
            : isExactMatch;

          // Simple link (no items) vs expandable section (has items)
          if (sec.items.length === 0) {
            return (
              <li key={sec.id} className="t-docs-nav__main-list__item">
                <a
                  className={`t-docs-nav__main-list__item__heading-group t-docs-nav__sub-list__article ${
                    isActive ? "is-active" : ""
                  }`}
                  href={sec.basePath}
                  aria-current={isActive ? "page" : undefined}
                >
                  <img
                    src={helpers.icon(`${sec.icon}:outlined`, "material")}
                    inline="true"
                  />
                  <span className="t-docs-nav__main-list__item__heading">
                    {sec.heading}
                  </span>
                </a>
              </li>
            );
          }

          // Expandable section with items
          const sectionHomePage = search.page(`url=${sec.basePath}`);
          const isSectionHomeActive = sectionHomePage &&
            normalizedUrl === sectionHomePage.url?.replace(/\/$/, "");

          return (
            <li key={sec.id} className="t-docs-nav__main-list__item">
              <details
                {...(isActive ? { open: true } : {})}
                className={isActive ? "is-active" : ""}
              >
                <summary
                  className={`t-docs-nav__main-list__item__heading-group ${
                    isActive ? "is-active" : ""
                  }`}
                >
                  <img
                    src={helpers.icon(`${sec.icon}:outlined`, "material")}
                    inline="true"
                  />
                  <span className="t-docs-nav__main-list__item__heading">
                    {sec.heading}
                  </span>
                  <img
                    src={helpers.icon(
                      "arrow_forward_ios:outlined",
                      "material",
                    )}
                    inline="true"
                  />
                </summary>

                <ol className="t-docs-nav__sub-list">
                  {/* Section home page link (Overview) */}
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

                  {/* Reference items (pre-filtered, pre-sorted) */}
                  {sec.items.map((item, index) => (
                    <li key={item.gid || index}>
                      <a
                        className="t-docs-nav__sub-list__article"
                        href={item.url}
                        aria-current={currentUrl.startsWith(item.url)
                          ? "page"
                          : undefined}
                      >
                        {item.useCode
                          ? <code className="code-no-box">{item.name}</code>
                          : item.name}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          );
        })}
      </ol>
      {/* <ScrollGradient position="bottom" /> */}
    </NavWrapper>
  );
}
