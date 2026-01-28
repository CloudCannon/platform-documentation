import NavLinks from './NavLinks.jsx';

export default function Nav({ headingnav, url, helpers }) {
    const items = headingnav?.items || [];
    
    return (
        <nav x-data="" className="l-header"
            alpine-resize-window={`
                if(window.innerWidth > 1023){
                    isMainNavOpen = false;
                }
            `}>
            <div className="l-header__site">
                <a href="/documentation" className="l-header__emblem" aria-label="Go to cloudcannon.com">
                    <img src="/assets/img/cc-docs-logo.svg" className="l-header__logo" alt="Go to cloudcannon.com" inline="true" />
                </a>
            </div>

            <div className="l-header__middle">
                <NavLinks headingnav={headingnav} url={url} helpers={helpers} />
            </div>
            
            <div className="l-header__right">
                <button x-on:click="isModalOpen = true; $focusSearch(true);" className="l-header__search" title="Search">
                    <img src={helpers.icon("search:outlined", "material")} inline="true" />
                </button>
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
                <a className="cc-helper__button" href="https://app.cloudcannon.com/register">Go to App</a>
            </div>
            
            <div className="l-header__mobile-controls">
                <button 
                    x-on:click="isModalOpen = true; $focusSearch(true);" 
                    className="l-header__search" 
                    alpine:class="isMainNavOpen ? 'hidden' : ''" 
                    title="Search"
                >
                    <img src={helpers.icon("search:outlined", "material")} inline="true" />
                </button>
                <button 
                    x-on:click="isMainNavOpen = !isMainNavOpen; $focusNav(isMainNavOpen);" 
                    className="l-header__search menu" 
                    alpine:class="isMainNavOpen ? 'hidden' : ''" 
                    title="Menu"
                >
                    <img src={helpers.icon("menu:outlined", "material")} inline="true" />
                </button>
                <button 
                    x-on:click="isMainNavOpen = !isMainNavOpen; $focusNav(isMainNavOpen);$refs.back_button.parentElement.style.left = '0'" 
                    className="l-header__search menu close" 
                    alpine:class="!isMainNavOpen ? 'hidden' : ''" 
                    title="Close Menu"
                >
                    <img src={helpers.icon("close:outlined", "material")} inline="true" />
                </button>
            </div>

            <div className="l-header__mobile-menu" x-show="isMainNavOpen" x-trap-noscroll="isMainNavOpen">
                <div className="button-container" x-data="{ show_message: true }">
                    <a className="cc-helper__button" href="https://app.cloudcannon.com/register">Go to App</a>
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
                </div>

                <div id="mobile-docnav" x-show="showmobilenav">
                    <div className="back-button" alpine:click="$el.parentElement.style.left = '-100%'" x-ref="back_button">
                        <img src={helpers.icon("arrow_back_ios:filled", "material")} inline="true" />
                        Back to main menu
                    </div>
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
            </div>
        </nav>
    );
}
