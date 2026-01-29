import NavWrapper from './NavWrapper.tsx';
import NavHeading from './NavHeading.tsx';
import type { ChangelogYears } from '../../_types.d.ts';

interface ChangeNavProps {
    title: string;
    url?: string;
    changelogYears?: () => ChangelogYears;
}

export default function ChangeNav({ title, url, changelogYears }: ChangeNavProps) {
    const years = changelogYears?.() || { keys: [] };
    
    return (
        <NavWrapper>
            <NavHeading title={title} />

            <ol className="t-docs-nav__main-list"
                x-init="new ResizeObserver((entries) => {
                height = $refs.navParent.getBoundingClientRect().height;
                scrollHeight = $refs.navParent.scrollHeight;
            }).observe($el)">
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
                        className={`t-docs-nav__main-list__item changelog-nav ${url?.startsWith(`/documentation/changelog/${year}/`) ? "selected" : ""}`}
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
