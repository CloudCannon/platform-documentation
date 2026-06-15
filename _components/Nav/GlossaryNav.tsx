import type { Comp } from "../../_types.d.ts";

interface GlossaryNavProps {
  title: string;
  allLetters?: () => string[];
  comp: Comp;
}

export default function GlossaryNav(
  { comp, title, allLetters }: GlossaryNavProps,
) {
  const letters = allLetters?.() || [];

  return (
    <comp.Nav.NavWrapper>
      <comp.Nav.NavHeading title={title} />

      <ol
        className="t-docs-nav__main-list glossary"
        x-data="glossaryNav"
      >
        {letters.map((letter) => (
          <li key={letter} className="t-docs-nav__main-list__item glossary-nav">
            <a
              className="cc-helper__button"
              x-bind:class={`{ 'selected': active === '#${letter.toLowerCase()}' }`}
              href={`/documentation/user-glossary/#${letter.toLowerCase()}`}
            >
              {letter}
            </a>
          </li>
        ))}
      </ol>
      <div x-intersect="more = false" x-intersect:leave="more = true" />
    </comp.Nav.NavWrapper>
  );
}
