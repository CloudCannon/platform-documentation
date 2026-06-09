import type { ChangelogYears, Comp } from "../../_types.d.ts";

interface ChangeNavProps {
  title: string;
  url?: string;
  changelogYears?: () => ChangelogYears;
  comp: Comp;
}

export default function ChangeNav(
  { comp, title, url, changelogYears }: ChangeNavProps,
) {
  const years = changelogYears?.() || { keys: [] };

  return (
    <comp.Nav.NavWrapper>
      <comp.Nav.NavHeading title={title} />

      <ol
        className="t-docs-nav__main-list"
        x-init="new ResizeObserver((entries) => {
                height = $refs.navParent.getBoundingClientRect().height;
                scrollHeight = $refs.navParent.scrollHeight;
            }).observe($el)"
      >
        <li
          className={`t-docs-nav__main-list__item changelog-nav ${
            url === "/changelog/" ? "selected" : ""
          }`}
          {...(url === "/changelog/"
            ? { "aria-current": "page" }
            : {})}
        >
          <a href="/documentation/changelog/">
            <span className="t-docs-nav__main-list__item__heading">
              Most recent
            </span>
            <div className="changelog-count">3</div>
          </a>
        </li>

        {years.keys?.map((year) => (
          <li
            key={year}
            className={`t-docs-nav__main-list__item changelog-nav ${
              url?.startsWith(`/changelog/${year}/`)
                ? "selected"
                : ""
            }`}
          >
            <a href={`/documentation/changelog/${year}/`}>
              <span className="t-docs-nav__main-list__item__heading">
                {year}
              </span>
              <div className="changelog-count">{years[year]}</div>
            </a>
          </li>
        ))}
      </ol>
      <div x-intersect="more = false" x-intersect:leave="more = true" />
    </comp.Nav.NavWrapper>
  );
}
