export default function ChangeNav({ title, url, changelogYears }) {
    const years = changelogYears?.() || { keys: [] };
    
    return (
        <nav 
            id="t-docs-nav" 
            className="t-docs-nav" 
            alpine:class="isPageNavOpen ? 't-docs-nav t-docs-nav--open' : 't-docs-nav'" 
            x-init="$getNavMemory?.()"
        >
            <div className="t-docs-nav__heading">
                <h2>{title}</h2>
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
                <li className={`t-docs-nav__main-list__item changelog-nav ${url === "/documentation/changelog/" ? "selected" : ""}`}
                    {...(url === "/documentation/changelog/" ? { 'aria-current': 'page' } : {})}>
                    <a href="/documentation/changelog/">
                        <span className="t-docs-nav__main-list__item__heading">Most recent</span>
                        <div className="changelog-count">3</div>
                    </a>
                </li>

                {years.keys?.map(year => (
                    <li 
                        key={year}
                        className={`t-docs-nav__main-list__item changelog-nav ${url === `/documentation/changelog/${year}/` ? "selected" : ""}`}
                    >
                        <a href={`/documentation/changelog/${year}/`}>
                            <span className="t-docs-nav__main-list__item__heading">{year}</span>
                            <div className="changelog-count">{years[year]}</div>
                        </a>
                    </li>
                ))}
            </ol>
            <div x-intersect="more = false" x-intersect:leave="more = true" />
        </nav>
    );
}
