import type { HeaderNavigation, Helpers } from "../../_types.d.ts";

interface NavLinksProps {
  headingnav?: HeaderNavigation;
  url?: string;
  helpers: Helpers;
}

export default function NavLinks({ headingnav, url, helpers }: NavLinksProps) {
  const items = headingnav?.items || [];

  return (
    <ol className="l-header__links">
      {items.map((item, index) => {
        const hasSubItems = item.items && item.items.length > 0;
        const isActive = item.href && url?.includes(item.href);
        const popoverId = `nav-dropdown-${index}`;

        return (
          <li key={index}>
            {hasSubItems
              ? (
                // Dropdown trigger button with popover
                <button
                  type="button"
                  className="l-header__link-trigger"
                  popovertarget={popoverId}
                  {...(isActive ? { "aria-current": "page" } : {})}
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
              >
                <ul>
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
