import type { SectionId } from "../../_components/Reference/helpers.ts";
import type { SchemaDoc } from "../../developer/reference/api/_shared/openapi.ts";
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
  schema?: SchemaDoc;
  title?: string;
  page?: Page;
  ref_nav?: RefNavSection[];
  url?: string;
  search?: PageSearch;
  comp: Comp;
}

export default function ApiSchemaLayout(
  { comp, schema, title, page, ref_nav, url, search }: Props,
  helpers: Helpers,
) {
  if (!schema) {
    return <div>Error: No schema provided</div>;
  }

  const currentUrl = page?.data?.url || url || "";
  const heading = title || schema.name;

  const breadcrumbItems = [
    { label: "Developer Reference", href: "/documentation/developer-reference/" },
    { label: "API", href: "/documentation/developer-reference/api/" },
    {
      label: "Schemas",
      href: "/documentation/developer-reference/api/schemas/",
    },
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

        <div className="u-card-box l-content">
          <comp.Layout.Breadcrumb items={breadcrumbItems} helpers={helpers} />

          <div>
            <h1 className="l-heading u-margin-bottom-0">{heading}</h1>
          </div>

          <div className="l-copy-page-mobile" data-pagefind-ignore>
            <comp.CopyPageDropdown title={heading} url={currentUrl} helpers={helpers} />
          </div>

          <main id="main-content">
            {schema.description && <p>{schema.description}</p>}
            <comp.Api.ApiSchema rows={schema.rows} helpers={helpers} />
          </main>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
