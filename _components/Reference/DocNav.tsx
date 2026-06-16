import type { SectionId } from "./helpers.ts";
import type { Comp, Helpers, PageSearch } from "../../_types.d.ts";

// Precompiled reference navigation item (matches _config.ts)
interface RefNavItem {
  url: string;
  name: string;
  useCode?: boolean;
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
  comp: Comp;
}

// A top-level group of sections, rendered under a group heading.
interface NavGroup {
  label: string;
  // Page providing the group's overview/home, looked up by url.
  homeUrl: string;
  // Ordered section ids to render under this group.
  sectionIds: string[];
}

export default function DocNav(
  {
    comp,
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
  const indexPage = search.page("url=/developer-reference/");

  // Helper to build a simple (item-less) section entry from a static page.
  const pageSection = (
    url: string,
    id: string,
    icon: string,
    fallback: string,
  ): RefNavSection | null => {
    const p = search.page(`url=${url}`);
    if (!p) return null;
    return {
      id: id as SectionId,
      heading: p.attrs?.details?.title || p.title || fallback,
      icon,
      basePath: p.url || url,
      items: [],
    };
  };

  // Collect every section, keyed by id, then arrange them into groups below.
  const sectionsById: Record<string, RefNavSection> = {};
  for (const sec of ref_nav) sectionsById[sec.id] = sec;

  const register = (sec: RefNavSection | null) => {
    if (sec) sectionsById[sec.id] = sec;
  };

  register(
    pageSection(
      "/developer-reference/editable-regions/",
      "editable-regions",
      "preview",
      "Editable Regions",
    ),
  );
  register(
    pageSection(
      "/developer-reference/visual-editor-api/",
      "visual-editor-api",
      "dashboard_customize",
      "Visual Editor API",
    ),
  );
  register(
    pageSection(
      "/developer-reference/schemas/",
      "schemas",
      "data_object",
      "JSON Schemas",
    ),
  );
  register(
    pageSection(
      "/developer-reference/typescript/",
      "typescript",
      "code",
      "TypeScript Types",
    ),
  );
  register(
    pageSection("/developer-reference/sdk/", "sdk", "extension", "SDK"),
  );
  register(pageSection("/developer-reference/cli/", "cli", "terminal", "CLI"));
  register(
    pageSection(
      "/developer-reference/permissions/",
      "permissions",
      "groups",
      "Permissions",
    ),
  );

  // Two top-level groups, each with a home page and an ordered set of sections.
  const groups: NavGroup[] = [
    {
      label: "Site configuration",
      homeUrl: "/developer-reference/site-configuration/",
      sectionIds: [
        "type.Configuration",
        "type.InitialSiteSettings",
        "type.Routing",
        "editable-regions",
        "visual-editor-api",
        "schemas",
        "typescript",
      ],
    },
    {
      label: "Platform",
      homeUrl: "/developer-reference/platform/",
      sectionIds: ["cli", "sdk", "type.Api", "permissions"],
    },
  ];

  // Renders a single section: a simple link (no items) or an expandable group.
  const renderSection = (sec: RefNavSection) => {
    // Some sections (e.g. API) carry a basePath/item urls that include the
    // "/documentation" prefix, but page urls (and currentUrl) are indexed
    // without it — strip the prefix before any comparison.
    const normalizedBasePath = sec.basePath
      .replace(/^\/documentation/, "")
      .replace(/\/$/, "");
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
            href={helpers.url(sec.basePath)}
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

    // Expandable section with items.
    const sectionHomePage = search.page(`url=${normalizedBasePath}/`);
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
            {/* Section home page link (Overview) - only when distinct from first item */}
            {sectionHomePage &&
              sectionHomePage.url?.replace(/\/$/, "") !==
                sec.items[0]?.url?.replace(/\/$/, "") &&
              (
                <li>
                  <a
                    className="t-docs-nav__sub-list__article"
                    href={helpers.url(sectionHomePage.url)}
                    aria-current={isSectionHomeActive ? "page" : undefined}
                  >
                    {sectionHomePage.attrs?.details?.title ||
                      sectionHomePage.title ||
                      "Overview"}
                  </a>
                </li>
              )}

            {/* Reference items */}
            {sec.items.map((item, index) => (
              <li key={item.gid || index}>
                <a
                  className="t-docs-nav__sub-list__article"
                  href={helpers.url(item.url)}
                  aria-current={currentUrl.startsWith(
                      item.url.replace(/^\/documentation/, ""),
                    )
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
  };

  // Renders a group heading as plain text (not a link).
  const renderGroupHeading = (group: NavGroup) => (
    <li key={`group:${group.label}`} className="t-docs-nav__group">
      <span className="t-docs-nav__group__label">{group.label}</span>
    </li>
  );

  // Renders the group's "Overview" link, sitting at the top of the group under
  // the heading and pointing at the group's home page.
  const renderOverviewLink = (group: NavGroup) => {
    const homePage = search.page(`url=${group.homeUrl}`);
    const homeUrl = homePage?.url || group.homeUrl;
    const isActive = normalizedUrl === homeUrl.replace(/\/$/, "");
    return (
      <li
        key={`overview:${group.label}`}
        className="t-docs-nav__main-list__item"
      >
        <a
          className={`t-docs-nav__main-list__item__heading-group t-docs-nav__sub-list__article ${
            isActive ? "is-active" : ""
          }`}
          href={helpers.url(homeUrl)}
          aria-current={isActive ? "page" : undefined}
        >
          <span className="t-docs-nav__main-list__item__heading">Overview</span>
        </a>
      </li>
    );
  };

  return (
    <comp.Nav.NavWrapper>
      {/* <comp.Nav.ScrollGradient position="top" /> */}
      <comp.Nav.NavHeading title="Developer Reference" />

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
        {indexPage && renderSection({
          id: "home" as SectionId,
          heading: indexPage.attrs?.details?.title || indexPage.title || "Home",
          icon: "home",
          basePath: indexPage.url || "/developer-reference/",
          items: [],
        })}

        {groups.flatMap((group) => [
          renderGroupHeading(group),
          renderOverviewLink(group),
          ...group.sectionIds
            .map((id) => sectionsById[id])
            .filter(Boolean)
            .map(renderSection),
        ])}
      </ol>
      {/* <comp.Nav.ScrollGradient position="bottom" /> */}
    </comp.Nav.NavWrapper>
  );
}
