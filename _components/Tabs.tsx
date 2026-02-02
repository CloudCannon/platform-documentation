interface TabChild {
  props?: {
    name?: string;
  };
}

interface TabsProps {
  name: string;
  children: TabChild | TabChild[];
}

export default function Tabs({ name, children }: TabsProps) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const tabs = childrenArray?.map((child) => child?.props?.name ?? "") ?? [];
  const tabButtons = tabs.map((tab) => {
    return (
      <button
        type="button"
        className="c-tabs__tab"
        alpine:click={`selectedTab = '${tab}'`}
        //{...{":aria-selected": `selectedTab === '${tab}'`}}
        role="tab"
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
            selectedTab: "${tabs?.[0] ?? "none"}"
        }`}
    >
      <div
        data-pagefind-ignore
        className="c-tabs__nav"
        role="tablist"
        aria-label={name}
      >
        {tabButtons}
      </div>
      {children}
    </div>
  );
}
