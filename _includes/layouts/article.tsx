import DocNav from "../../_components/Nav/DocNav.tsx";
import RelatedArticles from "../../_components/Content/RelatedArticles.tsx";
import Breadcrumb from "../../_components/Layout/Breadcrumb.tsx";
import MobileTOC from "../../_components/Layout/MobileTOC.tsx";
import NavSidebar from "../../_components/Layout/NavSidebar.tsx";
import { formatTitle, parseDocUrl } from "../../_components/utils/index.ts";
import type {
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
}

export default function ArticleLayout(props: Props, helpers: Helpers) {
  const {
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
        data-pagefind-filter="site:Documentation"
        data-pagefind-meta="site:Documentation"
      >
      <div className="l-column">
        <NavSidebar>
          {navData && search && (
            <DocNav
              navigation={navData}
              url={url}
              page={page}
              search={search}
              helpers={helpers}
              getIndexPage={helpers.get_index_page}
              bubbleUpNav={helpers.bubble_up_nav}
            />
          )}
        </NavSidebar>
        <div className="u-card-box l-content" x-data="visibleNavHighlighter">
          {urlParts.length > 1 && (
            <Breadcrumb
              items={[{
                label: formatTitle(navKey),
                href: `/documentation/${navKey}/`,
              }]}
              helpers={helpers}
            />
          )}
          <div>
            <h1
              className="l-heading u-margin-bottom-0"
              data-editable="text"
              data-prop="details.title"
            >
              {details?.title}
            </h1>
          </div>
          <p className="l-subheading" data-pagefind-ignore>
            Last modified: {helpers.date(date, "HUMAN_DATE")}
          </p>
          <MobileTOC helpers={helpers} />
          <div className="l-content-split">
            <main
              id="main-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <aside data-pagefind-ignore className="l-right">
              <div className="l-toc" alpine:scroll="onScroll()" />
            </aside>
          </div>

          {search && (
            <RelatedArticles
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
