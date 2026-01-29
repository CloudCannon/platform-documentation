import type { HeaderNavigation, Helpers } from '../../_types.d.ts';

interface NavLinksProps {
    headingnav?: HeaderNavigation;
    url?: string;
    helpers: Helpers;
}

export default function NavLinks({ headingnav, url, helpers }: NavLinksProps) {
    const items = headingnav?.items || [];
    
    return (
        <ol className="l-header__links" x-data={`{ open: -1,
            lockScroll() {
                if (this.open > -1) {
                    document.documentElement.style.overflow = 'hidden';
                    document.documentElement.style.paddingRight = '0px';
                } else {
                    document.documentElement.style.overflow = '';
                    document.documentElement.style.paddingRight = '';
                }
            }
        }`}
        x-init="$watch('open', () => lockScroll())">
            {items.map((item, index) => {
                const loopIndex = index + 1;
                const hasSubItems = item.items && item.items.length > 0;
                const isActive = item.href && url?.includes(item.href);
                
                return (
                    <li key={index}>
                        <a
                            tabIndex="0"
                            alpine-click-stop={`open = open == ${loopIndex} ? -1 : ${loopIndex};$focus.within($refs.dropdown_menu_${index}).first()`}
                            alpine-keydown-down={`open = open == ${loopIndex} ? -1 : ${loopIndex};$focus.within($refs.dropdown_menu_${index}).first()`}
                            alpine-keydown-up={`open = open == ${loopIndex} ? -1 : ${loopIndex};$focus.within($refs.dropdown_menu_${index}).last()`}
                            alpine:class={`open == ${loopIndex} ? 'open' : ''`}
                            {...(isActive ? { 'aria-current': 'page' } : {})}
                            {...(item.href ? { href: item.href } : {})}
                        >
                            {item.text}
                            {hasSubItems && (
                                <>
                                    {' '}
                                    <img src={helpers.icon("chevron_right:filled", "material")} inline="true" />
                                </>
                            )}
                        </a>
                        {hasSubItems && (
                            <div className="l-header__links--sub-list">
                                <ul
                                    x-ref={`dropdown_menu_${index}`}
                                    alpine-click-outside="open = -1"
                                    alpine-keydown-down="$focus.wrap().next()"
                                    alpine-keydown-up="$focus.wrap().previous()"
                                    alpine-keydown-escape="open = -1"
                                    x-trap-inert={`open == ${loopIndex}`}
                                >
                                    {item.items!.map((subitem, subIndex) => (
                                        <li key={subIndex}>
                                            <a className="c-card-grid__card--item" href={subitem.href}>
                                                <img src={helpers.icon(`${subitem.icon}:outlined`, "material")} inline="true" />
                                                <h3>{subitem.heading}</h3>
                                                <div>{/* spacer for grid layout */}</div>
                                                <p>{subitem.description}</p>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
