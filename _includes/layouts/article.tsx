import { formatTitle } from "../../_components/utils/string-util.ts";
import {
  getPagefindContentType,
  parseDocUrl,
} from "../../_components/utils/url-util.ts";
import type {
  Comp,
  ContentNavigation,
  Details,
  Helpers,
  Page,
  PageSearch,
} from "../../_types.d.ts";


interface AuthorNotes {
  docshots?: string;
  custom_search_weight?: number;
}

interface Props {
  content: string;
  url: string;
  page?: Page;
  navigation?: Record<string, ContentNavigation>;
  details?: Details;
  date: string;
  search?: PageSearch;
  author_notes?: AuthorNotes;
  comp: Comp;
}

export default function ArticleLayout(props: Props, helpers: Helpers) {
  const {
    comp,
    content,
    url,
    page,
    navigation,
    details,
    date,
    search,
    author_notes,
  } = props;

  const { navKey, urlParts } = parseDocUrl(url);
  const navData = navigation?.[navKey];

  return (
    <div className="l-page" x-init="showmobilenav = true"
        data-pagefind-body
        data-pagefind-weight={author_notes?.custom_search_weight || 50}
        data-pagefind-filter="site:Articles"
        data-pagefind-meta="site:Articles"
      >
      <comp.Layout.PagefindCategoryMeta category={getPagefindContentType(url)} />
      <comp.Layout.PagefindArticleCategoryMeta category={details?.category} />
      <div className="l-column">
        <comp.Layout.NavSidebar>
          {navData && search && (
            <comp.Nav.DocNav
              navigation={navData}
              url={url}
              page={page}
              search={search}
              helpers={helpers}
              getIndexPage={helpers.get_index_page}
              bubbleUpNav={helpers.bubble_up_nav}
            />
          )}
        </comp.Layout.NavSidebar>
        <div className="u-card-box l-content" x-data="visibleNavHighlighter">
          {urlParts.length > 1 && (
            <comp.Layout.Breadcrumb
              items={[{
                label: formatTitle(navKey),
                href: `/documentation/${navKey}/`,
              }]}
              helpers={helpers}
            />
          )}
          <h1
            className="l-heading u-margin-bottom-0"
            data-editable="text"
            data-prop="details.title"
          >
            {details?.title}
          </h1>
          <p className="l-subheading" data-pagefind-ignore>
            Last modified: {helpers.date(date, "HUMAN_DATE")}
          </p>
          <div className="l-copy-page-mobile" data-pagefind-ignore>
            <comp.CopyPageDropdown title={details?.title || ""} url={url} helpers={helpers} />
          </div>
          <comp.Layout.MobileTOC helpers={helpers} />
          <div className="l-content-split">
            <main
              id="main-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <aside data-pagefind-ignore className="l-right">
              <comp.CopyPageDropdown title={details?.title || ""} url={url} helpers={helpers} />
              <div className="l-toc" {...{ "x-on:scroll.window.throttle.50ms": "onScroll()" }} />
            </aside>
          </div>

          {search && (
            <comp.Content.RelatedArticles
              details={details}
              search={search}
              helpers={helpers}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
