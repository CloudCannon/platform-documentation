import DocNav from "../../_components/Nav/DocNav.tsx";
import NavSidebar from "../../_components/Layout/NavSidebar.tsx";
import NotFoundContent from "../../_components/Layout/NotFoundContent.tsx";
import type { ContentNavigation, Helpers, PageSearch } from "../../_types.d.ts";

interface Props {
  navigation?: Record<string, ContentNavigation>;
  url?: string;
  page?: {
    data?: {
      _uuid?: string;
    };
  };
  search?: PageSearch;
  nav_key?: string;
}

export default function NotFoundArticleLayout(props: Props, helpers: Helpers) {
  const { navigation, url, page, search, nav_key = "developer-articles" } = props;
  const navData = navigation?.[nav_key];

  return (
    <div className="l-page">
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
        <div className="u-card-box l-content">
          <main id="main-content" style="margin: 0 auto;">
            <NotFoundContent />
          </main>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
export const title = "Page not found";
