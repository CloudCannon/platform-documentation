import type { SectionId } from "./helpers.ts";
import type { RefNavSection } from "../../developer/reference/_shared/buildRefNav.ts";
import type { Comp, Helpers, PageSearch } from "../../_types.d.ts";

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
        "type.VisualEditorAPI",
        "schemas",
        "typescript",
      ],
    },
    {
      label: "Platform",
      homeUrl: "/developer-reference/platform/",
      sectionIds: ["cli", "sdk", "type.Api", "type.ApiSchemas", "permissions"],
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
            <span aria-hidden="true">
              <img
                src={helpers.icon(`${sec.icon}:outlined`, "material")}
                inline="true"
              />
            </span>
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
            <span aria-hidden="true">
              <img
                src={helpers.icon(`${sec.icon}:outlined`, "material")}
                inline="true"
              />
            </span>
            <span className="t-docs-nav__main-list__item__heading">
              {sec.heading}
            </span>
            <span aria-hidden="true">
              <img
                src={helpers.icon(
                  "arrow_forward_ios:outlined",
                  "material",
                )}
                inline="true"
              />
            </span>
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
                    {sec.homeLabel ||
                      sectionHomePage.attrs?.details?.title ||
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
      <h3 className="t-docs-nav__group__label">{group.label}</h3>
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
          aria-label={`${group.label} overview`}
        >
          <span aria-hidden="true">
            <img
              src={helpers.icon("info:outlined", "material")}
              inline="true"
            />
          </span>
          <span className="t-docs-nav__main-list__item__heading">Overview</span>
        </a>
      </li>
    );
  };

  return (
    <comp.Nav.NavWrapper>
      {/* <comp.Nav.ScrollGradient position="top" /> */}
      <div
        className="t-docs-nav__filter-scope"
        x-data={`{
          filter: '',
          items: [],
          hash: '',
          init() {
            this.items = globalThis.__refNavItems || [];
            this.hash = globalThis.location?.hash || '';
            try { this.filter = sessionStorage.getItem('cc:ref-filter') || ''; } catch {}
            this.$watch('filter', (v) => {
              try {
                if (v) sessionStorage.setItem('cc:ref-filter', v);
                else sessionStorage.removeItem('cc:ref-filter');
              } catch {}
            });
            globalThis.addEventListener('hashchange', () => {
              this.hash = globalThis.location.hash || '';
            });
            this.$nextTick(() => {
              const active = this.$el.querySelector(
                '.t-docs-nav__filter-results [aria-current=page]'
              );
              if (!active) return;
              const scroller = this.$el.closest('.t-docs-nav');
              if (!scroller) return;
              const sRect = scroller.getBoundingClientRect();
              const aRect = active.getBoundingClientRect();
              const offset = aRect.top - sRect.top + scroller.scrollTop;
              scroller.scrollTop = offset - scroller.clientHeight / 2 + aRect.height / 2;
            });
          },
          get filtered() {
            const q = this.filter.trim().toLowerCase();
            if (!q) return [];
            return this.items.filter((i) =>
              i.name.toLowerCase().includes(q) ||
              (i.keywords && i.keywords.includes(q))
            );
          },
          get currentUrl() {
            const p = globalThis.location?.pathname || '';
            const trimmed = p.endsWith('/') ? p.slice(0, -1) : p;
            return trimmed + this.hash;
          },
          get filteredSections() {
            const SECTION_ORDER = [
              'API',
              'API Schemas',
              'Visual Editor API',
              'CLI',
              'SDK',
              'Configuration File',
              'Routing File',
              'Initial Site Settings File',
              'Editable Regions',
              'Permissions',
              'JSON Schemas',
              'TypeScript Types',
              'Developer Reference',
            ];
            const rank = (name) => {
              const i = SECTION_ORDER.indexOf(name);
              return i === -1 ? SECTION_ORDER.length : i;
            };
            const currentUrl = this.currentUrl;
            const sectionMap = new Map();
            for (const item of this.filtered) {
              let section = sectionMap.get(item.section);
              if (!section) {
                section = { name: item.section, parentMap: new Map() };
                sectionMap.set(item.section, section);
              }
              let parent = section.parentMap.get(item.parent);
              if (!parent) {
                parent = {
                  name: item.parent,
                  useCode: item.parentUseCode !== undefined ? item.parentUseCode : item.useCode,
                  items: [],
                };
                section.parentMap.set(item.parent, parent);
              }
              parent.items.push(item);
            }
            const sectionTotal = (s) => {
              let n = 0;
              for (const p of s.parentMap.values()) n += p.items.length;
              return n;
            };
            return Array.from(sectionMap.values())
              .sort((a, b) => sectionTotal(b) - sectionTotal(a) || rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
              .map((section) => ({
                name: section.name,
                parents: Array.from(section.parentMap.values())
                  .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name))
                  .map((parent) => {
                    const items = parent.items
                      .map((item) => ({
                        ...item,
                        display: item.name.startsWith(parent.name + ' ')
                          ? item.name.slice(parent.name.length + 1)
                          : item.name,
                        isCurrent: (() => {
                          const parts = item.url.split('#');
                          const path = parts[0];
                          const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
                          const normalized = parts.length > 1 ? trimmed + '#' + parts[1] : trimmed;
                          return normalized === currentUrl;
                        })(),
                      }));
                    // Collapse a single-item group whose sole item echoes the
                    // parent name into a flat link — searching e.g. "site:*"
                    // in Permissions would otherwise force a click into every
                    // "1 match" accordion just to reveal the same text as the
                    // link inside.
                    const flatSingle = items.length === 1 && items[0].name === parent.name;
                    return {
                      name: parent.name,
                      useCode: parent.useCode,
                      hasCurrent: items.some((i) => i.isCurrent),
                      flatSingle,
                      items,
                    };
                  }),
              }));
          },
        }`}
      >
        <comp.Nav.NavHeading title="Developer Reference" />

        <div className="t-docs-nav__filter">
          <div className="t-docs-nav__filter-input-wrap">
            <span className="t-docs-nav__filter-icon" aria-hidden="true">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
                <path d="M12.755 11.255H11.965l-.28-.27a6.501 6.501 0 10-.7.7l.27.28v.79L16.255 17.745l1.49-1.49-4.99-4.99zM6.755 11.255a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
              </svg>
            </span>
            <input
              type="search"
              className="t-docs-nav__filter-input"
              placeholder="Find a key"
              x-model="filter"
              aria-label="Filter reference keys"
            />
            <button
              type="button"
              className="t-docs-nav__filter-clear"
              x-show="filter"
              x-on:click="filter = ''"
              aria-label="Clear filter"
            >
              <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M14.348 5.652a1 1 0 010 1.414L11.414 10l2.934 2.934a1 1 0 11-1.414 1.414L10 11.414l-2.934 2.934a1 1 0 01-1.414-1.414L8.586 10 5.652 7.066a1 1 0 011.414-1.414L10 8.586l2.934-2.934a1 1 0 011.414 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filtered results — visible when filter has any non-whitespace input */}
        <div
          className="t-docs-nav__filter-results"
          x-show="filter.trim()"
          x-cloak
        >
          <div x-show="filtered.length > 0">
            <template
              x-for="section in filteredSections"
              x-bind:key="section.name"
            >
              <div className="t-docs-nav__filter-section">
                <h4
                  className="t-docs-nav__filter-section-heading"
                  x-text="section.name"
                ></h4>
                <template
                  x-for="parent in section.parents"
                  x-bind:key="parent.name"
                >
                  <div className="t-docs-nav__filter-group">
                    <template x-if="parent.flatSingle">
                      <a
                        x-bind:href="parent.items[0].url"
                        x-bind:aria-current="parent.items[0].isCurrent ? 'page' : null"
                        x-bind:class="'t-docs-nav__filter-group-heading t-docs-nav__filter-group-heading--flat' + (parent.items[0].isCurrent ? ' active' : '')"
                      >
                        <span className="t-docs-nav__filter-group-name">
                          <code
                            x-show="parent.useCode"
                            className="code-no-box"
                            x-text="parent.name"
                          ></code>
                          <span x-show="!parent.useCode" x-text="parent.name"></span>
                        </span>
                      </a>
                    </template>
                    <template x-if="!parent.flatSingle">
                      <details x-bind:open="parent.hasCurrent">
                        <summary className="t-docs-nav__filter-group-heading">
                          <svg
                            aria-hidden="true"
                            className="t-docs-nav__filter-group-chevron"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                          >
                            <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
                          </svg>
                          <span className="t-docs-nav__filter-group-name">
                            <code
                              x-show="parent.useCode"
                              className="code-no-box"
                              x-text="parent.name"
                            ></code>
                            <span x-show="!parent.useCode" x-text="parent.name"></span>
                          </span>
                          <span
                            className="t-docs-nav__filter-group-count"
                            x-text="parent.items.length + (parent.items.length === 1 ? ' match' : ' matches')"
                          ></span>
                        </summary>
                        <ol className="t-docs-nav__sub-list">
                          <template
                            x-for="item in parent.items"
                            x-bind:key="item.url"
                          >
                            <li x-bind:class="item.isCurrent ? 'active' : ''">
                              <a
                                x-bind:href="item.url"
                                x-bind:aria-current="item.isCurrent ? 'page' : null"
                                className="t-docs-nav__sub-list__article t-docs-nav__filter-row"
                              >
                                <code
                                  x-show="item.useCode"
                                  className="code-no-box t-docs-nav__filter-path"
                                  x-text="item.display"
                                ></code>
                                <span
                                  x-show="!item.useCode"
                                  className="t-docs-nav__filter-path"
                                  x-text="item.display"
                                ></span>
                                <span
                                  x-show="item.context"
                                  className="t-docs-nav__filter-context"
                                  x-text="item.context"
                                ></span>
                              </a>
                            </li>
                          </template>
                        </ol>
                      </details>
                    </template>
                  </div>
                </template>
              </div>
            </template>
          </div>
          <p
            className="t-docs-nav__filter-empty"
            x-show="filtered.length === 0"
          >
            No matches for <strong x-text="filter"></strong>
          </p>
        </div>

      <ol
        className="t-docs-nav__main-list"
        x-show="!filter.trim()"
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
      </div>
      {/* <comp.Nav.ScrollGradient position="bottom" /> */}
    </comp.Nav.NavWrapper>
  );
}
