import type { RefNavSection } from "../../developer/reference/_shared/buildRefNav.ts";
import type { Comp, Helpers, Page, PageSearch } from "../../_types.d.ts";
import {
  CLI_BASE_PATH,
  CliCommandDocumentation,
  cliCommandPath,
} from "../../developer/reference/_shared/command-line-interface.ts";

interface Props {
  command: CliCommandDocumentation;
  page?: Page;
  ref_nav?: RefNavSection[];
  url?: string;
  search?: PageSearch;
  comp: Comp;
}

export default function CliReferenceLayout(
  {
    comp,
    command,
    page,
    ref_nav,
    url,
    search,
  }: Props,
  helpers: Helpers,
) {
  const currentUrl = page?.data?.url || url || "";
  const commandPath = cliCommandPath(command);

  const breadcrumbItems = [
    {
      label: "Developer Reference",
      href: "/documentation/developer-reference/",
    },
    {
      label: "Command Line Interface",
      href: `/documentation${CLI_BASE_PATH}`,
    },
    ...commandPath.slice(0, -1).map((segment, index) => ({
      label: segment,
      href: `/documentation${CLI_BASE_PATH}${
        commandPath.slice(0, index + 1).join("/")
      }/`,
    })),
  ];

  return (
    <div
      className="l-page"
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
              section="cli"
              search={search}
              helpers={helpers}
            />
          )}
        </comp.Layout.NavSidebar>

        <div className="u-card-box l-content" x-data="visibleNavHighlighter">
          <comp.Layout.Breadcrumb items={breadcrumbItems} helpers={helpers} />

          <div>
            <h1 className="l-heading u-margin-bottom-0">
              <code>{command.fullName.replace("cloudcannon ", "")}</code>
            </h1>
          </div>

          <div className="l-copy-page-mobile" data-pagefind-ignore>
            <comp.CopyPageDropdown
              title={command.fullName}
              url={currentUrl}
              helpers={helpers}
            />
          </div>
          {(command.subCommands ?? []).length > 0 && (
            <comp.Layout.MobileTOC helpers={helpers} listClassName="">
              <comp.Reference.CliTableOfContents command={command} />
            </comp.Layout.MobileTOC>
          )}

          <div className="l-content-split">
            <main id="main-content">
              <comp.Reference.CliReferenceContent
                comp={comp}
                command={command}
                helpers={helpers}
              />
            </main>

            <aside data-pagefind-ignore className="l-right">
              <comp.CopyPageDropdown
                title={command.fullName}
                url={currentUrl}
                helpers={helpers}
              />
              <div
                className="l-toc"
                {...{ "x-on:scroll.window.throttle.50ms": "onScroll()" }}
              >
                <comp.Reference.CliTableOfContents
                  command={command}
                  withHeading
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
