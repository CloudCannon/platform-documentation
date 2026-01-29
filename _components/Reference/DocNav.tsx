import RefNavItem from './RefNavItem.tsx';
import NavWrapper from '../Nav/NavWrapper.tsx';
import NavHeading from '../Nav/NavHeading.tsx';
import ScrollGradient from '../Nav/ScrollGradient.tsx';
import type { 
    Helpers, 
    ContentNavItem, 
    ContentNavigation,
    PageSearch,
    DocEntry
} from '../../_types.d.ts';

interface RefNavListProps {
    currentDoc?: unknown;
    currentUrl?: string;
    items?: DocEntry[];
}

function RefNavList({ currentDoc, currentUrl, items }: RefNavListProps) {
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

interface ArticleGroupProps {
    block: ContentNavItem;
    page?: {
        data?: {
            _uuid?: string;
            url?: string;
        };
    };
    search: PageSearch;
    helpers: Helpers;
}

function ArticleGroup({ block, page, search, helpers }: ArticleGroupProps) {
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

interface DocNavProps {
    navigation: ContentNavigation;
    currentDoc?: {
        gid?: string;
    };
    currentUrl: string;
    items?: DocEntry[];
    page?: {
        data?: {
            _uuid?: string;
            url?: string;
        };
    };
    search: PageSearch;
    helpers: Helpers;
}

export default function DocNav({ navigation, currentDoc, currentUrl, items, page, search, helpers }: DocNavProps) {
    if (!navigation) {
        return <nav id="t-docs-nav" className="t-docs-nav">No navigation data</nav>;
    }
    
    const indexPage = search.page(`url^=${currentUrl.split('/').slice(0, 3).join('/')}/`);
    const headings = navigation.headings || [];
    
    return (
        <NavWrapper>
            <ScrollGradient position="top" />
            <NavHeading title={navigation.title} />
                
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
                <ScrollGradient position="bottom" />
            </NavWrapper>
    );
}

export { RefNavList, ArticleGroup };
