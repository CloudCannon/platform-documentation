import NavLinks from './NavLinks.tsx';
import type { HeaderNavigation, Helpers } from '../../_types.d.ts';

interface NavProps {
    headingnav?: HeaderNavigation;
    url?: string;
    helpers: Helpers;
}

function DarkLightToggle({helpers}: {helpers: Helpers}) {
    return (
        <>
            <input 
                type="checkbox" 
                id="light_dark" 
                alpine:click="darkMode = darkMode == 'dark' ? 'light' : 'dark'; localStorage.setItem('cc_darkMode',darkMode)" 
                alpine:checked="darkMode == 'dark'" 
            />
            <label htmlFor="light_dark" className="l-header__search light-darkmode" title="Light/Dark mode">
                <div className="light-darkmode__button dark">
                    <img src={helpers.icon("dark_mode:filled", "material")} inline="true" />
                </div>
                <div className="light-darkmode__button light">
                    <img src={helpers.icon("light_mode:filled", "material")} inline="true" />
                </div>
            </label>
        </>
    );
}

export default function Nav({ headingnav, url, helpers }: NavProps) {
    const items = headingnav?.items || [];
    
    return (
        <nav className="l-header">
            <div className="l-header__site">
                <a href="/documentation" className="l-header__emblem" aria-label="Go to cloudcannon.com">
                    <img src="/assets/img/cc-docs-logo.svg" className="l-header__logo" alt="Go to cloudcannon.com" inline="true" />
                </a>
            </div>

            <div className="l-header__middle">
                <NavLinks headingnav={headingnav} url={url} helpers={helpers} />
            </div>
            
            <div className="l-header__right">
                <button type="button" x-on:click="isModalOpen = true; $focusSearch(true);" className="l-header__search" title="Search">
                    <img src={helpers.icon("search:outlined", "material")} inline="true" />
                </button>
                <DarkLightToggle helpers={helpers} />
                <a className="cc-helper__button" href="https://app.cloudcannon.com/register">Go to App</a>
            </div>
            
            <div className="l-header__mobile-controls">
                <button 
                    type="button"
                    x-on:click="isModalOpen = true; $focusSearch(true);" 
                    className="l-header__search" 
                    title="Search"
                >
                    <img src={helpers.icon("search:outlined", "material")} inline="true" />
                </button>
                <button 
                    type="button"
                    onclick="document.getElementById('mobile-menu').showModal()"
                    className="l-header__search menu" 
                    title="Menu"
                >
                    <img src={helpers.icon("menu:outlined", "material")} inline="true" />
                </button>
            </div>

            <dialog 
                id="mobile-menu" 
                className="l-header__mobile-menu"
            >
                <div className="l-header__mobile-menu-header">
                    <button 
                        type="button"
                        onclick="document.getElementById('mobile-menu').close()"
                        className="l-header__search menu close" 
                        title="Close Menu"
                    >
                        <img src={helpers.icon("close:outlined", "material")} inline="true" />
                    </button>
                </div>
                <div className="button-container">
                    <a className="cc-helper__button" href="https://app.cloudcannon.com/register">Go to App</a>
                    <input 
                        type="checkbox" 
                        id="light_dark_mobile" 
                        alpine:click="darkMode = darkMode == 'dark' ? 'light' : 'dark'; localStorage.setItem('cc_darkMode',darkMode)" 
                        alpine:checked="darkMode == 'dark'" 
                    />
                    <label htmlFor="light_dark_mobile" className="l-header__search light-darkmode" title="Light/Dark mode">
                        <div className="light-darkmode__button dark">
                            <img src={helpers.icon("dark_mode:filled", "material")} inline="true" />
                        </div>
                        <div className="light-darkmode__button light">
                            <img src={helpers.icon("light_mode:filled", "material")} inline="true" />
                        </div>
                    </label>
                </div>

                <div className="l-header__links--sub-list">
                    <ul className="l-header__links">
                        {items.map((item, index) => {
                            const isLast = index === items.length - 1;
                            if (item.items?.length) {
                                return item.items.map((subitem, subIndex) => (
                                    <li key={`${index}-${subIndex}`}>
                                        <a className="c-card-grid__card--item" href={subitem.href}>
                                            {subitem.icon ? (
                                                <img src={helpers.icon(`${subitem.icon}:outlined`, "material")} inline="true" />
                                            ) : (
                                                <div>{/* spacer for grid layout */}</div>
                                            )}
                                            <h3>{subitem.heading}</h3>
                                            <div>{/* spacer for grid layout */}</div>
                                            <p>{subitem.description}</p>
                                        </a>
                                    </li>
                                )).concat(!isLast ? [<li key={`divider-${index}`} className="l-header__links--divider" />] : []);
                            }
                            return [
                                <li key={index}>
                                    <a className="c-card-grid__card--item" href={item.href}>
                                        {item.text}
                                    </a>
                                </li>
                            ].concat(!isLast ? [<li key={`divider-${index}`} className="l-header__links--divider" />] : []);
                        })}
                    </ul>
                </div>
            </dialog>
        </nav>
    );
}
