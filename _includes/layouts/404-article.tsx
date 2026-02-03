import DocNav from "../../_components/Nav/DocNav.tsx";
import NavSidebar from "../../_components/Layout/NavSidebar.tsx";
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
}

export default function NotFoundArticleLayout(props: Props, helpers: Helpers) {
  const { navigation, url, page, search } = props;
  const navData = navigation?.["developer-articles"];

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
          <main id="main-content">
            <div className="l-home-card">
              <h1 className="l-heading l-center-heading" data-skip-anchor="">
                Page not found
              </h1>
              <p style={{ "text-align": "center" }}>
                We couldn't find the page you were looking for. It either
                doesn't exist or has been moved.
              </p>

              <pagefind-modal-trigger placeholder="Search"></pagefind-modal-trigger>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export const layout = "layouts/base.tsx";
export const title = "Page not found";
