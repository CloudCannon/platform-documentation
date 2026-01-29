import NavWrapper from './NavWrapper.tsx';
import NavHeading from './NavHeading.tsx';
import ScrollGradient from './ScrollGradient.tsx';
import type { 
    ContentNavItem, 
    ContentNavBlock, 
    ContentNavigation,
    IndexPage,
    PageSearch
} from '../../_types.d.ts';

interface SubNavProps {
    block: ContentNavItem;
    url?: string;
    pageUuid?: string;
    search: PageSearch;
    helpers: {
        icon: (name: string, set: string) => string;
    };
}

function SubNav({ block, url, pageUuid, search, helpers }: SubNavProps) {
    if (!block.items?.length) return null;
    
    return (
        <ol className="t-docs-nav__sub-list">
            {block.items.map((item, i) => {
                if (item._type === "group") {
                    const isOpen = item._bubbled?.includes(pageUuid || '');
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

interface DocNavProps {
    navigation: ContentNavigation;
    url?: string;
    page?: {
        data?: {
            _uuid?: string;
        };
    };
    search: PageSearch;
    helpers: {
        icon: (name: string, set: string) => string;
    };
    getIndexPage?: (url?: string) => IndexPage | null;
    bubbleUpNav?: (headings?: ContentNavBlock[]) => ContentNavBlock[];
}

export default function DocNav({ navigation, url, page, search, helpers, getIndexPage, bubbleUpNav }: DocNavProps) {
    const indexPage = getIndexPage?.(url);
    const headings = bubbleUpNav?.(navigation.headings) || navigation.headings || [];
    const pageUuid = page?.data?._uuid;
    
    return (
        <NavWrapper>
            <ScrollGradient position="top" />
            <NavHeading title={navigation.title} />
            
            <ol className="t-docs-nav__main-list"
                x-init="new ResizeObserver((entries) => {
                height = $refs.navParent.getBoundingClientRect().height;
                scrollHeight = $refs.navParent.scrollHeight;
            }).observe($el)">
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
                    const isActive = block._bubbled?.includes(pageUuid || '');
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
            <ScrollGradient position="bottom" />
        </NavWrapper>
    );
}
