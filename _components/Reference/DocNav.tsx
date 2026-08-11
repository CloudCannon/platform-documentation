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

  // Find static pages for nav entries
  const schemasPage = search.page(
    "url=/developer-reference/schemas/",
  );
  const typescriptPage = search.page(
    "url=/developer-reference/typescript/",
  );
  const editableRegionsPage = search.page(
    "url=/developer-reference/editable-regions/",
  );
  const permissionsPage = search.page(
    "url=/developer-reference/permissions/",
  );

  // Build unified nav entries: home link + utility links + sections
  const allEntries: RefNavSection[] = [];

  if (indexPage) {
    allEntries.push({
      id: "home" as SectionId,
      heading: indexPage.attrs?.details?.title || indexPage.title || "Home",
      icon: "home",
      basePath: indexPage.url || "/developer-reference/",
      items: [], // No items = renders as simple link
    });
  }

  allEntries.push(...ref_nav);
  if (editableRegionsPage) {
    allEntries.push({
      id: "editable-regions" as SectionId,
      heading: editableRegionsPage.attrs?.details?.title ||
        editableRegionsPage.title || "Editable Regions",
      icon: "preview",
      basePath: editableRegionsPage.url ||
        "/developer-reference/editable-regions/",
      items: [],
    });
  }

  if (permissionsPage) {
    allEntries.push({
      id: "permissions" as SectionId,
      heading: permissionsPage.attrs?.details?.title || permissionsPage.title ||
        "Permissions",
      icon: "groups",
      basePath: permissionsPage.url ||
        "/developer-reference/permissions/",
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
        "/developer-reference/schemas/",
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
        "/developer-reference/typescript/",
      items: [],
    });
  }
  // The flat items array for the filter is generated once at build time in
  // _config.ts and served as a static JS file that assigns to
  // window.__refNavItems. Alpine reads that global from init() below.

  return (
    <comp.Nav.NavWrapper>
      {/* <comp.Nav.ScrollGradient position="top" /> */}
      <div
        className="t-docs-nav__filter-scope"
        x-data={`{
          filter: '',
          items: [],
          init() {
            this.items = globalThis.__refNavItems || [];
            try { this.filter = sessionStorage.getItem('cc:ref-filter') || ''; } catch {}
            this.$watch('filter', (v) => {
              try {
                if (v) sessionStorage.setItem('cc:ref-filter', v);
                else sessionStorage.removeItem('cc:ref-filter');
              } catch {}
            });
          },
          get filtered() {
            const q = this.filter.trim().toLowerCase();
            if (!q) return [];
            return this.items.filter((i) => i.name.toLowerCase().includes(q));
          },
          get filteredGroups() {
            const map = new Map();
            for (const item of this.filtered) {
              const key = item.name;
              if (!map.has(key)) {
                map.set(key, {
                  key,
                  name: item.name,
                  useCode: item.useCode,
                  items: [],
                });
              }
              map.get(key).items.push(item);
            }
            for (const g of map.values()) {
              g.items.sort((a, b) => a.section.localeCompare(b.section) || a.path.localeCompare(b.path));
            }
            return Array.from(map.values())
              .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
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
              x-for="group in filteredGroups"
              x-bind:key="group.key"
            >
              <div className="t-docs-nav__filter-group">
                <div className="t-docs-nav__filter-group-heading">
                  <span className="t-docs-nav__filter-group-name">
                    <code
                      x-show="group.useCode"
                      className="code-no-box"
                      x-text="group.name"
                    ></code>
                    <span x-show="!group.useCode" x-text="group.name"></span>
                  </span>
                  <span
                    className="t-docs-nav__filter-group-count"
                    x-text="group.items.length + (group.items.length === 1 ? ' match' : ' matches')"
                  ></span>
                </div>
                <ol className="t-docs-nav__sub-list">
                  <template x-for="item in group.items" x-bind:key="item.url">
                    <li>
                      <a
                        x-bind:href="item.url"
                        className="t-docs-nav__sub-list__article t-docs-nav__filter-row"
                      >
                        <span
                          className="t-docs-nav__filter-path"
                          x-text="item.path"
                        ></span>
                      </a>
                    </li>
                  </template>
                </ol>
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
                  {/* Section home page link (Overview) - only when distinct from first item */}
                  {sectionHomePage &&
                    sectionHomePage.url?.replace(/\/$/, "") !==
                      sec.items[0]?.url?.replace(/\/$/, "") &&
                    (
                      <li>
                        <a
                          className="t-docs-nav__sub-list__article"
                          href={helpers.url(sectionHomePage.url)}
                          aria-current={isSectionHomeActive
                            ? "page"
                            : undefined}
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
      </div>
      {/* <comp.Nav.ScrollGradient position="bottom" /> */}
    </comp.Nav.NavWrapper>
  );
}
