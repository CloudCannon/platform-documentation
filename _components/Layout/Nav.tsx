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
        x-data="{ hasDocNav: false, showBanner: true }"
        x-init="showBanner = !document.getElementById('announcement-banner')?.hidden"
        x-effect="if (showmobilenav) hasDocNav = true"
      >
        {/* Banner - full width, mirrors the main page banner visibility */}
        {headingnav?.banner_html && (
          <div
            className="l-banner"
            x-show="showBanner"
          >
            <div className="l-banner__inner">
              <div
                dangerouslySetInnerHTML={{ __html: headingnav.banner_html }}
              />
              <button
                type="button"
                aria-label="close announcement banner"
                x-on:click="showBanner = false; sessionStorage.setItem('announcementBannerOpenDocs', 'false'); document.getElementById('announcement-banner').hidden = true;"
              >
                <div className="flex items-center">
                  <div className="inner-cross">
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Content wrapper - matches main nav padding/centering */}
        <div className="l-header__mobile-menu-content">
          {/* Header row - mirrors main nav layout */}
          <div className="l-header__mobile-menu-header">
            <div className="l-header__site">
              <a
                href="/documentation"
                className="l-header__emblem"
                aria-label="Go to CloudCannon Documentation"
              >
                <img
                  src="/assets/img/cc-docs-logo.svg"
                  className="l-header__logo"
                  alt="CloudCannon Documentation"
                  inline="true"
                />
              </a>
            </div>
            <div className="l-header__mobile-controls">
              <button
                type="button"
                x-on:click="isModalOpen = true; $focusSearch(true); document.getElementById('mobile-menu').close()"
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
          </div>

          {/* Button container - always visible above both panels */}
          <div className="button-container">
            <a
              className="cc-helper__button"
              href="https://app.cloudcannon.com/register"
            >
              Go to App
            </a>
            <ThemeDropdown helpers={helpers} id="theme-dropdown-mobile" />
          </div>

          {/* Main menu panel - hidden when docnav is shown */}
        <div className="mobile-menu-panel" x-show="!showmobilenav">
          {/* Link to show docnav - only visible on pages with doc navigation */}
          <div
            className="mobile-docnav-trigger"
            x-show="hasDocNav"
            x-on:click="showmobilenav = true"
          >
            <img
              src={helpers.icon("menu_book:outlined", "material")}
              inline="true"
            />
            <span>Section navigation</span>
            <img
              src={helpers.icon("arrow_forward_ios:filled", "material")}
              inline="true"
            />
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
        </div>

          {/* Docnav panel - shown when showmobilenav is true */}
          <div
            id="mobile-docnav"
            className="mobile-menu-panel"
            x-show="showmobilenav"
          >
            <div
              className="back-button"
              x-on:click="showmobilenav = false"
            >
              <img
                src={helpers.icon("arrow_back_ios:filled", "material")}
                inline="true"
              />
              <span>Back to main menu</span>
            </div>
            {/* Teleported content from NavSidebar appears here */}
          </div>
        </div>
      </dialog>
    </nav>
  );
}
