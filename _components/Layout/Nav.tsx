import NavLinks from "./NavLinks.tsx";
import type { HeaderNavigation, Helpers } from "../../_types.d.ts";

interface NavProps {
  headingnav?: HeaderNavigation;
  url?: string;
  helpers: Helpers;
}

function ThemeDropdown(
  { helpers, id = "theme-dropdown" }: { helpers: Helpers; id?: string },
) {
  return (
    <>
      <button
        type="button"
        className="l-header__search theme-toggle"
        popovertarget={id}
        title="Theme"
      >
        <template x-if="effectiveTheme === 'dark'">
          <img
            src={helpers.icon("dark_mode:filled", "material")}
            inline="true"
          />
        </template>
        <template x-if="effectiveTheme === 'light'">
          <img
            src={helpers.icon("light_mode:filled", "material")}
            inline="true"
          />
        </template>
      </button>
      <div id={id} popover="auto" className="theme-dropdown">
        <button
          type="button"
          x-on:click="setTheme('system')"
          alpine:class="themePreference === 'system' ? 'active' : ''"
        >
          <img
            src={helpers.icon("brightness_6:outlined", "material")}
            inline="true"
          />
          System
        </button>
        <button
          type="button"
          x-on:click="setTheme('light')"
          alpine:class="themePreference === 'light' ? 'active' : ''"
        >
          <img
            src={helpers.icon("light_mode:filled", "material")}
            inline="true"
          />
          Light
        </button>
        <button
          type="button"
          x-on:click="setTheme('dark')"
          alpine:class="themePreference === 'dark' ? 'active' : ''"
        >
          <img
            src={helpers.icon("dark_mode:filled", "material")}
            inline="true"
          />
          Dark
        </button>
      </div>
    </>
  );
}

export default function Nav({ headingnav, url, helpers }: NavProps) {
  const items = headingnav?.items || [];

  return (
    <nav className="l-header">
      <div className="l-header__site">
        <a
          href="/documentation"
          className="l-header__emblem"
          aria-label="Go to cloudcannon.com"
        >
          <img
            src="/assets/img/cc-docs-logo.svg"
            className="l-header__logo"
            alt="Go to cloudcannon.com"
            inline="true"
          />
        </a>
      </div>

      <div className="l-header__middle">
        <NavLinks headingnav={headingnav} url={url} helpers={helpers} />
      </div>

      <div className="l-header__right">
        <button
          type="button"
          x-on:click="isModalOpen = true; $focusSearch(true);"
          className="l-header__search"
          title="Search"
        >
          <img
            src={helpers.icon("search:outlined", "material")}
            inline="true"
          />
        </button>
        <ThemeDropdown helpers={helpers} />
        <a
          className="cc-helper__button"
          href="https://app.cloudcannon.com/register"
        >
          Go to App
        </a>
      </div>

      <div className="l-header__mobile-controls">
        <button
          type="button"
          x-on:click="isModalOpen = true; $focusSearch(true);"
          className="l-header__search"
          title="Search"
        >
          <img
            src={helpers.icon("search:outlined", "material")}
            inline="true"
          />
        </button>
        <button
          type="button"
          onclick="document.getElementById('mobile-menu').showModal()"
          className="l-header__search menu"
          title="Menu"
        >
          <img src={helpers.icon("menu:outlined", "material")} inline="true" />
        </button>
      </div>

      <dialog
        id="mobile-menu"
        className="l-header__mobile-menu"
      >
        <div className="l-header__mobile-menu-header">
          <button
            type="button"
            onclick="document.getElementById('mobile-menu').close()"
            className="l-header__search menu close"
            title="Close Menu"
          >
            <img
              src={helpers.icon("close:outlined", "material")}
              inline="true"
            />
          </button>
        </div>
        <div className="button-container">
          <a
            className="cc-helper__button"
            href="https://app.cloudcannon.com/register"
          >
            Go to App
          </a>
          <ThemeDropdown helpers={helpers} id="theme-dropdown-mobile" />
        </div>

        <div className="l-header__links--sub-list">
          <ul className="l-header__links">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              if (item.items?.length) {
                return item.items.map((subitem, subIndex) => (
                  <li key={`${index}-${subIndex}`}>
                    <a className="c-card-grid__card--item" href={subitem.href}>
                      {subitem.icon
                        ? (
                          <img
                            src={helpers.icon(
                              `${subitem.icon}:outlined`,
                              "material",
                            )}
                            inline="true"
                          />
                        )
                        : <div>{/* spacer for grid layout */}</div>}
                      <h3>{subitem.heading}</h3>
                      <div>{/* spacer for grid layout */}</div>
                      <p>{subitem.description}</p>
                    </a>
                  </li>
                )).concat(
                  !isLast
                    ? [
                      <li
                        key={`divider-${index}`}
                        className="l-header__links--divider"
                      />,
                    ]
                    : [],
                );
              }
              return [
                <li key={index}>
                  <a className="c-card-grid__card--item" href={item.href}>
                    {item.text}
                  </a>
                </li>,
              ].concat(
                !isLast
                  ? [
                    <li
                      key={`divider-${index}`}
                      className="l-header__links--divider"
                    />,
                  ]
                  : [],
              );
            })}
          </ul>
        </div>
      </dialog>
    </nav>
  );
}
