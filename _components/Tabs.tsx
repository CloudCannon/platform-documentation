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

        init() {
          this.syncTabToHash();
          globalThis.addEventListener('hashchange', () => this.syncTabToHash());
        },

        // Select the tab containing the element the URL fragment points at, so
        // in-page links to a heading inside a hidden panel still work.
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

          const target = document.getElementById(id);
          const panel = target?.closest('.c-tabs__panel');
          if (!panel || panel.closest('.c-tabs') !== this.$el) {
            return;
          }

          const name = panel.dataset.tabName;
          if (!name || name === this.selectedTab) {
            return;
          }

          this.selectedTab = name;
          this.$nextTick(() => target.scrollIntoView());
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
