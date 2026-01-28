import NavWrapper from './NavWrapper.jsx';
import NavHeading from './NavHeading.jsx';

export default function ChangeNav({ title, url, changelogYears }) {
    const years = changelogYears?.() || { keys: [] };
    
    return (
        <NavWrapper>
            <NavHeading title={title} />

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
        </NavWrapper>
    );
}
