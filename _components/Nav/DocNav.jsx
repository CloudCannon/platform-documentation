function SubNav({ block, url, pageUuid, search, helpers }) {
    if (!block.items?.length) return null;
    
    return (
        <ol className="t-docs-nav__sub-list">
            {block.items.map((item, i) => {
                if (item._type === "group") {
                    const isOpen = item._bubbled?.includes(pageUuid);
                    return (
                        <li key={i}>
                            <details 
                                {...(isOpen ? { open: true } : {})}
                                className={`${isOpen ? "nav-open" : ""} ${isOpen ? "is-active" : ""}`}
                                alpine:click="$setNavMemory?.()"
                            >
                                <summary className="t-docs-nav__sub-list__heading">
                                    {item.name}
                                    <img src={helpers.icon("chevron_right:outlined", "material")} inline="true" />
                                </summary>
                                <SubNav 
                                    block={item} 
                                    url={url} 
                                    pageUuid={pageUuid} 
                                    search={search} 
                                    helpers={helpers} 
                                />
                            </details>
                        </li>
                    );
                }
                
                return item.articles?.map((article, j) => {
                    const articlePage = search.page(`_uuid=${article}`);
                    if (!articlePage) return null;
                    
                    return (
                        <li key={`${i}-${j}`}>
                            <a 
                                className="t-docs-nav__sub-list__article"
                                {...(articlePage.url === url ? { 'aria-current': 'page' } : {})}
                                href={articlePage.url}
                                alpine:click="$setNavMemory?.()"
                            >
                                {articlePage.page?.data?.details?.title || articlePage.data?.details?.title}
                            </a>
                        </li>
                    );
                });
            })}
        </ol>
    );
}

export default function DocNav({ navigation, url, page, search, helpers, getIndexPage, bubbleUpNav }) {
    const indexPage = getIndexPage?.(url);
    const headings = bubbleUpNav?.(navigation.headings) || navigation.headings || [];
    const pageUuid = page?.data?._uuid;
    
    return (
        <nav 
            id="t-docs-nav" 
            className="t-docs-nav" 
            alpine:class="isPageNavOpen ? 't-docs-nav t-docs-nav--open' : 't-docs-nav'" 
            x-init="$getNavMemory?.()"
        >
            <div 
                className="c-scroll-area__gradient c-scroll-area__gradient--bottom"
                style={{ 
                    position: 'sticky', 
                    zIndex: 0, 
                    pointerEvents: 'none', 
                    width: 'calc(100% + 16px)', 
                    opacity: 1, 
                    height: '100px', 
                    top: 0, 
                    marginBottom: '-100px', 
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), transparent 70%)' 
                }}
                x-show="$el.scrollHeight > $el.clientHeight"
            />
            <div className="t-docs-nav__heading">
                <h2>{navigation.title}</h2>
                <button 
                    className="t-docs-nav__control" 
                    x-on:click="isPageNavOpen = true; $focusNav(true);" 
                    x-show="!isPageNavOpen" 
                    aria-label="Open docs menu"
                >
                    <img src="/assets/img/expand.svg" inline="true" />
                </button>
                <button 
                    className="t-docs-nav__control" 
                    x-on:click="isPageNavOpen = false; $focusNav(false);" 
                    x-show="isPageNavOpen" 
                    aria-label="Close docs menu"
                >
                    <img src="/assets/img/close.svg" inline="true" />
                </button>
            </div>
            
            <ol className="t-docs-nav__main-list">
                <li className="t-docs-nav__main-list__item">
                    <a 
                        className={`t-docs-nav__main-list__item__heading-group t-docs-nav__sub-list__article ${pageUuid === indexPage?.attrs?._uuid ? 'is-active' : ''}`}
                        href={indexPage?.url}
                    >
                        <img src={helpers.icon("home:outlined", "material")} inline="true" />
                        <span className="t-docs-nav__main-list__item__heading">
                            {indexPage?.attrs?.details?.title}
                        </span>
                    </a>
                </li>
                
                {headings.map((block, i) => {
                    const isActive = block._bubbled?.includes(pageUuid);
                    return (
                        <li 
                            key={i}
                            className="t-docs-nav__main-list__item" 
                            x-data={`{ navOpen: ${isActive}, isActive: ${isActive} }`}
                        >
                            {!block.heading_hidden && (
                                <div 
                                    className={`t-docs-nav__main-list__item__heading-group ${isActive ? 'is-active' : ''}`}
                                    alpine:class="navOpen ? 'nav-open' : ''"
                                    alpine:click="navOpen = !navOpen"
                                >
                                    {block.icon && (
                                        <img src={helpers.icon(`${block.icon}:outlined`, "material")} inline="true" />
                                    )}
                                    <span className="t-docs-nav__main-list__item__heading">{block.heading}</span>
                                    <img src={helpers.icon("arrow_forward_ios:outlined", "material")} inline="true" />
                                </div>
                            )}
                            <template x-if="navOpen">
                                <div>
                                    <SubNav 
                                        block={block} 
                                        url={url} 
                                        pageUuid={pageUuid} 
                                        search={search} 
                                        helpers={helpers} 
                                    />
                                </div>
                            </template>
                        </li>
                    );
                })}
            </ol>
            <div 
                className="c-scroll-area__gradient c-scroll-area__gradient--bottom"
                style={{ 
                    position: 'sticky', 
                    zIndex: 0, 
                    pointerEvents: 'none', 
                    width: 'calc(100% + 16px)', 
                    opacity: 1, 
                    height: '100px', 
                    bottom: 0, 
                    marginTop: '-100px', 
                    background: 'linear-gradient(to top, rgba(255, 255, 255, 1), transparent 70%)' 
                }}
                x-show="$el.scrollHeight > $el.clientHeight"
            />
        </nav>
    );
}
