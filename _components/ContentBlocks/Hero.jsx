export default function Hero({ helpers }) {
    return (
        <div className="c-hero">
            <h1 x-text="block.title"></h1>
            <div className="t-searcher">
                <div className="t-searcher-inner" alpine-click-away="isModalOpen = false; $focusSearch(false);">
                    <h2>Search</h2>
                    <div id="searchbox"></div>
                    <a className="mobile-filters cc-helper__altbutton" data-pfmod-suppressed="true">
                        Filters <img src={helpers.icon("expand_more:outlined", "material")} inline="true" />
                    </a>
                    <div id="searchcontainer">
                        <div id="searchfilter"></div>
                        <div id="resultscontainer">
                            <div id="searchsummary"></div>
                            <div id="searchresults"></div>
                        </div>
                    </div>
                    <div id="searchpagination"></div>
                    <div id="pagination-prev__template">
                        <img src={helpers.icon("arrow_back_ios:outlined", "material")} inline="true" />
                    </div>
                    <div id="pagination-next__template">
                        <img src={helpers.icon("arrow_forward_ios:outlined", "material")} inline="true" />
                    </div>
                </div>
            </div>
        </div>
    );
}
