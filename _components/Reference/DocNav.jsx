import RefNavItem from './RefNavItem.jsx';

function RefNavList({ currentDoc, currentUrl, items }) {
    const navItems = (items || []).filter(item => item.documentation?.show_in_navigation);
    
    return (
        <ol className="t-docs-nav__sub-list">
            {navItems.map(item => (
                <RefNavItem 
                    key={item.gid}
                    entry={item}
                    currentDoc={currentDoc}
                    currentUrl={currentUrl}
                />
            ))}
        </ol>
    );
}

function ArticleGroup({ block, page, search, helpers }) {
    if (!block.items?.length) return null;
    
    return (
        <ol className="t-docs-nav__sub-list">
            {block.items.map((item, idx) => {
                if (item._type === 'group') {
                    const isActive = page?.data?._uuid && item._bubbled?.includes(page.data._uuid);
                    return (
                        <li key={item.name || idx}>
                            <details 
                                open={isActive || undefined}
                                className={isActive ? 'nav-open is-active' : undefined}
                            >
                                <summary className="t-docs-nav__sub-list__heading">
                                    {item.name}
                                    <img src={helpers.icon('chevron_right:outlined', 'material')} inline="true" />
                                </summary>
                                <ArticleGroup block={item} page={page} search={search} helpers={helpers} />
                            </details>
                        </li>
                    );
                } else {
                    return item.articles?.map(articleUuid => {
                        const articlePage = search.page(`_uuid=${articleUuid}`);
                        if (!articlePage) return null;
                        
                        const isCurrent = articlePage.url === page?.data?.url;
                        return (
                            <li key={articleUuid}>
                                <a 
                                    className="t-docs-nav__sub-list__article"
                                    href={articlePage.url}
                                    aria-current={isCurrent ? 'page' : undefined}
                                >
                                    {articlePage.page?.data?.details?.title || articlePage.title}
                                </a>
                            </li>
                        );
                    });
                }
            })}
        </ol>
    );
}

export default function DocNav({ navigation, currentDoc, currentUrl, items, page, search, helpers }) {
    if (!navigation) {
        return <nav id="t-docs-nav" className="t-docs-nav">No navigation data</nav>;
    }
    
    const indexPage = search?.page?.(`url^=${currentUrl.split('/').slice(0, 3).join('/')}/`);
    const headings = navigation.headings || [];
    
    const gradientStyle = {
        position: 'sticky',
        zIndex: 0,
        pointerEvents: 'none',
        width: 'calc(100% + 16px)',
        opacity: 1,
        height: '100px'
    };
    
    return (
        <>
            <nav 
                id="t-docs-nav" 
                className="t-docs-nav"
                alpine:class="isPageNavOpen ? 't-docs-nav t-docs-nav--open' : 't-docs-nav'"
                x-init="$getNavMemory?.()"
            >
                <div 
                    className="c-scroll-area__gradient c-scroll-area__gradient--bottom"
                    style={{
                        ...gradientStyle,
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
                        alpine:click="isPageNavOpen = true; $focusNav(true);"
                        x-show="!isPageNavOpen"
                        aria-label="Open docs menu"
                    >
                        <img src="/assets/img/expand.svg" inline="true" />
                    </button>
                    <button 
                        className="t-docs-nav__control" 
                        alpine:click="isPageNavOpen = false; $focusNav(false);"
                        x-show="isPageNavOpen"
                        aria-label="Close docs menu"
                    >
                        <img src="/assets/img/close.svg" inline="true" />
                    </button>
                </div>
                
                <ol className="t-docs-nav__main-list">
                    {indexPage && (
                        <li className="t-docs-nav__main-list__item">
                            <a 
                                className={`t-docs-nav__main-list__item__heading-group t-docs-nav__sub-list__article ${
                                    page?.data?._uuid === indexPage.attrs?._uuid ? 'is-active' : ''
                                }`}
                                href={indexPage.url}
                            >
                                <img src={helpers.icon('home:outlined', 'material')} inline="true" />
                                <span className="t-docs-nav__main-list__item__heading">
                                    {indexPage.attrs?.details?.title || indexPage.title || 'Home'}
                                </span>
                            </a>
                        </li>
                    )}
                    
                    {headings.map((block, idx) => {
                        const isActive = (page?.data?._uuid && block._bubbled?.includes(page.data._uuid)) || 
                            (currentDoc?.gid && block.configuration_types_documentation);
                        
                        return (
                            <li 
                                key={block._uuid || idx}
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
                                            <img src={helpers.icon(`${block.icon}:outlined`, 'material')} inline="true" />
                                        )}
                                        <span className="t-docs-nav__main-list__item__heading">
                                            {block.heading}
                                        </span>
                                        <img src={helpers.icon('arrow_forward_ios:outlined', 'material')} inline="true" />
                                    </div>
                                )}
                                
                                <template x-if="navOpen">
                                    <div>
                                        {block.configuration_types_documentation ? (
                                            <RefNavList 
                                                currentDoc={currentDoc}
                                                currentUrl={currentUrl}
                                                items={items}
                                            />
                                        ) : (
                                            <ArticleGroup 
                                                block={block}
                                                page={page}
                                                search={search}
                                                helpers={helpers}
                                            />
                                        )}
                                    </div>
                                </template>
                            </li>
                        );
                    })}
                </ol>
                
                <div 
                    className="c-scroll-area__gradient c-scroll-area__gradient--bottom"
                    style={{
                        ...gradientStyle,
                        bottom: 0,
                        marginTop: '-100px',
                        background: 'linear-gradient(to top, rgba(255, 255, 255, 1), transparent 70%)'
                    }}
                    x-show="$el.scrollHeight > $el.clientHeight"
                />
            </nav>
        </>
    );
}

export { RefNavList, ArticleGroup };
