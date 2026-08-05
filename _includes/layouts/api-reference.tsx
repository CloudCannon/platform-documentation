import type { SectionId } from "../../_components/Reference/helpers.ts";
import type { ApiResource } from "../../developer/reference/api/_shared/openapi.ts";
import type { Comp, Helpers, Page, PageSearch } from "../../_types.d.ts";

interface RefNavItem {
  url: string;
  name: string;
  gid: string;
}

interface RefNavSection {
  id: SectionId;
  heading: string;
  icon: string;
  basePath: string;
  items: RefNavItem[];
}

interface Props {
  resource?: ApiResource;
  title?: string;
  page?: Page;
  ref_nav?: RefNavSection[];
  url?: string;
  search?: PageSearch;
  comp: Comp;
}

function ApiTableOfContents(
  { resource, withHeading = false }: {
    resource: ApiResource;
    withHeading?: boolean;
  },
) {
  if (!resource.operations.length) return null;
  return (
    <>
      {withHeading && (
        <h3 className="l-toc__heading" data-pagefind-ignore>
          On this page
        </h3>
      )}
      <ol className="l-toc__list" data-pagefind-ignore>
        {resource.operations.map((op) => (
          <li
            key={op.id}
            x-bind:class={`visibleHeadingId === '${op.id}' ? 'active' : ''`}
          >
            <a href={`#${op.id}`}>
              <span className="c-api-toc__item">
                <span
                  className={`c-api-toc__method c-api-toc__method--${op.method.toLowerCase()}`}
                >
                  {op.method}
                </span>
                <code className="code-no-box">{op.path}</code>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </>
  );
}

export default function ApiReferenceLayout(
  { comp, resource, title, page, ref_nav, url, search }: Props,
  helpers: Helpers,
) {
  if (!resource) {
    return <div>Error: No API resource provided</div>;
  }

  const currentUrl = page?.data?.url || url || "";
  const heading = title || resource.title;

  const breadcrumbItems = [
    { label: "Developer Reference", href: "/documentation/developer-reference/" },
    { label: "API", href: "/documentation/developer-reference/api/" },
  ];

  return (
    <div className="l-page"
      x-init="showmobilenav = true"
      data-pagefind-body
      data-pagefind-weight="0.1"
      data-pagefind-filter="site:Reference"
      data-pagefind-meta="site:Reference"
    >
      <comp.Layout.PagefindCategoryMeta category="Developer Reference" />
      <div className="l-column">
        <comp.Layout.NavSidebar className="developer-reference">
          {ref_nav && search && (
            <comp.Reference.DocNav
              ref_nav={ref_nav}
              currentUrl={currentUrl}
              section={"api" as unknown as SectionId}
              search={search}
              helpers={helpers}
            />
          )}
        </comp.Layout.NavSidebar>

        <div className="u-card-box l-content" x-data="visibleNavHighlighter">
          <comp.Layout.Breadcrumb items={breadcrumbItems} helpers={helpers} />

          <div>
            <h1 className="l-heading u-margin-bottom-0">{heading}</h1>
          </div>

          <div className="l-copy-page-mobile" data-pagefind-ignore>
            <comp.CopyPageDropdown title={heading} url={currentUrl} helpers={helpers} />
          </div>
          <comp.Layout.MobileTOC helpers={helpers} listClassName="">
            <ApiTableOfContents resource={resource} />
          </comp.Layout.MobileTOC>

          <div className="l-content-split">
            <main id="main-content">
              <comp.Api.ApiResource resource={resource} helpers={helpers} />
            </main>

            <aside data-pagefind-ignore className="l-right">
              <comp.CopyPageDropdown title={heading} url={currentUrl} helpers={helpers} />
              <div className="l-toc" {...{ "x-on:scroll.window.throttle.50ms": "onScroll()" }}>
                <ApiTableOfContents resource={resource} withHeading />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
