interface SearchProps {
  helpers: {
    icon: (name: string, set: string) => string;
  };
}

export default function Search({ helpers }: SearchProps) {
  return (
    <>
      <div
        className="t-searcher-modal"
        role="dialog"
        tabIndex="-1"
        x-transition=""
        x-show="isModalOpen"
        x-cloak=""
      >
        <div className="t-searcher">
          <div
            className="t-searcher-inner"
            alpine-click-away="isModalOpen = false; $focusSearch(false);"
          >
            <h2>Search</h2>
            <div id="searchbox" />
            <a
              className="mobile-filters cc-helper__altbutton"
              data-pfmod-suppressed="true"
            >
              Filters{" "}
              <img
                src={helpers.icon("expand_more:outlined", "material")}
                inline="true"
              />
            </a>
            <div id="searchcontainer">
              <div id="searchfilter" />
              <div id="resultscontainer">
                <div id="searchsummary" />
                <div id="searchresults" />
              </div>
            </div>
            <div id="searchpagination" />
            <div id="pagination-prev__template">
              <img
                src={helpers.icon("arrow_back_ios:outlined", "material")}
                inline="true"
              />
            </div>
            <div id="pagination-next__template">
              <img
                src={helpers.icon("arrow_forward_ios:outlined", "material")}
                inline="true"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="t-overlay" x-show="isModalOpen" x-cloak="" />
      <noscript>
        <div className="t-noscript-search">
          <p>
            Search requires JavaScript. Browse the{" "}
            <a href="/documentation/">documentation home</a>{" "}
            or use your browser's find function (Ctrl/Cmd+F).
          </p>
        </div>
      </noscript>
    </>
  );
}
