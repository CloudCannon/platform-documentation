import type { HeaderNavigation, Helpers } from "../../_types.d.ts";

interface NavLinksProps {
  headingnav?: HeaderNavigation;
  url?: string;
  helpers: Helpers;
}

export default function NavLinks({ headingnav, url, helpers }: NavLinksProps) {
  const items = headingnav?.items || [];

  return (
    <ol
      className="l-header__links"
      x-data="{ open: -1 }"
    >
      {items.map((item, index) => {
        const hasSubItems = item.items && item.items.length > 0;
        const isActive = item.href && url?.includes(item.href);
        const popoverId = `nav-dropdown-${index}`;
        const dropdownRef = `dropdown_menu_${index}`;

        return (
          <li key={index}>
            {hasSubItems
              ? (
                // Dropdown trigger button with popover and keyboard navigation
                <button
                  type="button"
                  className="l-header__link-trigger"
                  popovertarget={popoverId}
                  {...(isActive ? { "aria-current": "page" } : {})}
                  aria-expanded="false"
                  style={{ "anchor-name": `--nav-trigger-${index}` }}
                  alpine-keydown-down={`open = ${index}; document.getElementById('${popoverId}').showPopover(); $nextTick(() => $focus.within($refs.${dropdownRef}).first())`}
                  alpine-keydown-up={`open = ${index}; document.getElementById('${popoverId}').showPopover(); $nextTick(() => $focus.within($refs.${dropdownRef}).last())`}
                  x-on-click={`open = open === ${index} ? -1 : ${index}`}
                >
                  {item.text}{" "}
                  <img
                    src={helpers.icon("chevron_right:filled", "material")}
                    inline="true"
                  />
                </button>
              )
              : (
                // Regular link for items without sub-items
                <a
                  {...(isActive ? { "aria-current": "page" } : {})}
                  {...(item.href ? { href: item.href } : {})}
                >
                  {item.text}
                </a>
              )}
            {hasSubItems && (
              <div
                id={popoverId}
                popover="auto"
                className="l-header__links--sub-list"
                style={{ "position-anchor": `--nav-trigger-${index}` }}
                x-on-toggle={`if (!$event.newState || $event.newState === 'closed') open = -1`}
              >
                <ul
                  x-ref={dropdownRef}
                  alpine-keydown-down-prevent="$focus.wrap().next()"
                  alpine-keydown-up-prevent="$focus.wrap().previous()"
                  alpine-keydown-escape={`open = -1; document.getElementById('${popoverId}').hidePopover()`}
                  x-trap-inert={`open === ${index}`}
                >
                  {item.items!.map((subitem, subIndex) => (
                    <li key={subIndex}>
                      <a
                        className="c-card-grid__card--item"
                        href={subitem.href}
                      >
                        <img
                          src={helpers.icon(
                            `${subitem.icon}:outlined`,
                            "material",
                          )}
                          inline="true"
                        />
                        <h3>{subitem.heading}</h3>
                        <div>{/* spacer for grid layout */}</div>
                        <p>{subitem.description}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
