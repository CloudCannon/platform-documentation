import type { Comp } from "../../_types.d.ts";

interface InlineSearchProps {
  placeholder?: string;
  autofocus?: boolean;
  className?: string;
  comp: Comp;
}

/**
 * Inline search component with filters and results.
 * Used on the home page and 404 page.
 */
export default function InlineSearch({
  comp,
  placeholder = "Search documentation...",
  autofocus = false,
  className,
}: InlineSearchProps) {
  return (
    <div className={`t-inline-search ${className || ""}`}>
      <pagefind-input
        placeholder={placeholder}
        {...(autofocus ? { autofocus: true } : {})}
      ></pagefind-input>
      <div
        className="cc-search-recents"
        x-data="searchRecents"
        x-show="$store.search.hasFocus && !$store.search.hasQuery && $store.search.recents.length"
        x-cloak
      >
        <h3 className="cc-search-recents__title">Recent searches</h3>
        <ul className="cc-search-recents__list">
          <template x-for="term in $store.search.recents" x-bind:key="term">
            <li className="cc-search-recents__item">
              <button
                type="button"
                className="cc-search-recents__button"
                {...{
                  "x-on:click.stop.prevent": "triggerRecent(term)",
                  "x-on:mousedown.prevent": "void 0",
                }}
                x-bind:title="`Search for ${term}`"
              >
                <span className="cc-search-recents__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                  </svg>
                </span>
                <span x-text="term"></span>
              </button>
              <button
                type="button"
                className="cc-search-recents__remove"
                {...{
                  "x-on:click.stop.prevent": "removeRecent(term)",
                  "x-on:mousedown.prevent": "void 0",
                }}
                aria-label="Remove from recent searches"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L10.59 13.4l-6.3 6.3-1.41-1.42L9.17 12l-6.3-6.29 1.42-1.42 6.3 6.3 6.29-6.3z" />
                </svg>
              </button>
            </li>
          </template>
        </ul>
      </div>
      <comp.Layout.SearchResults />
    </div>
  );
}
