import NavWrapper from './NavWrapper.tsx';
import NavHeading from './NavHeading.tsx';

interface GlossaryNavProps {
    title: string;
    allLetters?: () => string[];
}

export default function GlossaryNav({ title, allLetters }: GlossaryNavProps) {
    const letters = allLetters?.() || [];
    
    return (
        <NavWrapper>
            <NavHeading title={title} />

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
        </NavWrapper>
    );
}
