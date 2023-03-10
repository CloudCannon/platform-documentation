export default function ({comp, name, children}) {
    children = Array.isArray(children) ? children : [children];
    const tabs = children?.map(child => child?.props?.name ?? "") ?? [];
    const tabButtons = tabs.map(tab => {
        return (
            <button className="c-tabs__tab"
                alpine:click={`selectedTab = '${tab}'`} 
                {...{":aria-selected": `selectedTab === '${tab}'`}}
                role="tab"
                key={tab}>
                { tab }
            </button>
        );
    })
    return (
        <div className="c-tabs"
        x-data={`{
            selectedTab: "${tabs?.[0] ?? "none"}"
        }`}>
            <div data-pagefind-ignore className="c-tabs__nav" role="tablist" aria-label={name}>
                {tabButtons}
            </div>
            {children}
        </div>
    );
}
