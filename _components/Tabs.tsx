import { slugify } from "./utils/string-util.ts";

interface TabChild {
  props?: {
    name?: string;
  };
}

interface TabsProps {
  label: string;
  children: TabChild | TabChild[];
}

// Generate a unique ID for each Tabs instance
let tabsCounter = 0;
function generateUniqueId(): string {
  return `tabs-${++tabsCounter}`;
}

export default function Tabs({ label, children }: TabsProps) {
  const uniqueId = generateUniqueId();
  const childrenArray = Array.isArray(children) ? children : [children];
  const tabs = childrenArray?.map((child) => child?.props?.name ?? "") ?? [];

  // Panel contents carry no ids of their own, because the anchor pass in
  // _config.ts only slugs `main h1, main h2` and panel headings are deeper than
  // that. Emit a slug per tab name so a link from outside the page can address
  // a panel directly as `#hugo`, using the same slugify the headings use.
  const tabsBySlug = Object.fromEntries(
    tabs.filter(Boolean).map((tab) => [slugify(tab), tab]),
  );

  const tabButtonKeyboardHandler = `
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const tabs = Array.from($el.parentElement.querySelectorAll('[role=tab]'));
      const currentIndex = tabs.indexOf($el);
      let newIndex;
      if (event.key === 'ArrowRight') {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      }
      tabs[newIndex].focus();
      tabs[newIndex].click();
    }
  `;

  const tabButtons = tabs.map((tab) => {
    return (
      <button
        type="button"
        className="c-tabs__tab"
        role="tab"
        id={`${uniqueId}-tab-${tab}`}
        aria-controls={`${uniqueId}-panel-${tab}`}
        x-bind:aria-selected={`selectedTab === '${tab}' ? 'true' : 'false'`}
        x-bind:tabindex={`selectedTab === '${tab}' ? '0' : '-1'`}
        x-on:click={`selectedTab = '${tab}'`}
        x-on:keydown={tabButtonKeyboardHandler}
        key={tab}
      >
        {tab}
      </button>
    );
  });

  return (
    <div
      className="c-tabs"
      x-data={`{
        selectedTab: "${tabs?.[0] ?? "none"}",
        tabsBySlug: ${JSON.stringify(tabsBySlug)},

        init() {
          this.syncTabToHash();
          globalThis.addEventListener('hashchange', () => this.syncTabToHash());
        },

        syncTabToHash() {
          const hash = (globalThis.location.hash || '').slice(1);
          if (!hash) {
            return;
          }

          let id = hash;
          try {
            id = decodeURIComponent(hash);
          } catch (_error) {
            // Keep the raw hash if it is not valid percent-encoding
          }

          // Select the tab containing the element the URL fragment points at,
          // so in-page links to a heading inside a hidden panel still work.
          const target = document.getElementById(id);
          const panel = target?.closest('.c-tabs__panel');
          if (panel && panel.closest('.c-tabs') === this.$el) {
            const name = panel.dataset.tabName;
            if (name && name !== this.selectedTab) {
              this.selectedTab = name;
              this.$nextTick(() => target.scrollIntoView());
            }
            return;
          }

          // Otherwise the fragment may name a tab itself, as in '#hugo'. This is
          // the form links from outside the page use, including the in-app
          // guides, which send a reader straight to their own SSG.
          const named = this.tabsBySlug[id.toLowerCase()];
          if (named && named !== this.selectedTab) {
            this.selectedTab = named;
          }
        }
      }`}
    >
      <div
        className="c-tabs__nav"
        role="tablist"
        aria-label={label}
        data-pagefind-ignore
      >
        {tabButtons}
      </div>
      {children}
    </div>
  );
}

export function toMarkdown(_props: TabsProps, childrenMd: string): string {
  return childrenMd;
}
