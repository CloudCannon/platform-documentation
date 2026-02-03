import TabsCopyButton from "./TabsCopyButton.tsx";

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
        className="c-code-block__tab"
        role="tab"
        id={`${uniqueId}-tab-${tab}`}
        aria-controls={`${uniqueId}-panel-${tab}`}
        x-bind:aria-selected={`selectedTab === '${tab}' ? 'true' : 'false'`}
        x-bind:tabindex={`selectedTab === '${tab}' ? '0' : '-1'`}
        x-on-click={`selectedTab = '${tab}'`}
        x-on-keydown={tabButtonKeyboardHandler}
        key={tab}
      >
        {tab}
      </button>
    );
  });

  return (
    <div
      className="c-code-block c-code-block--tabbed"
      x-data={`{ selectedTab: "${tabs?.[0] ?? "none"}" }`}
    >
      <div className="c-code-block__heading">
        <div
          className="c-code-block__tabs"
          role="tablist"
          aria-label={label}
          data-pagefind-ignore
        >
          {tabButtons}
        </div>
        <TabsCopyButton />
      </div>
      {children}
    </div>
  );
}
