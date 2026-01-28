export default function GlossaryNav({ title, allLetters, helpers }) {
    const letters = allLetters?.() || [];
    
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

            <ol 
                className="t-docs-nav__main-list glossary" 
                x-data="{ active: window.location.hash || '#a' }"
                x-init={`
                    window.addEventListener('hashchange', () => {
                        active = window.location.hash
                    })
                `}
            >
                {letters.map(letter => (
                    <li key={letter} className="t-docs-nav__main-list__item glossary-nav">
                        <a 
                            className="cc-helper__button"
                            alpine:class={`{ 'selected': active === '#${letter.toLowerCase()}' }`}
                            href={`/documentation/user-glossary/#${letter.toLowerCase()}`}
                        >
                            {letter}
                        </a>
                    </li>
                ))}
            </ol>
            <div x-intersect="more = false" x-intersect:leave="more = true" />
        </nav>
    );
}
