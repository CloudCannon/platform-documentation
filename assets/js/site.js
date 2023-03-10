import "../../_includes/scripts/alpine.js";
import { Instance, Input, ResultList, Summary, FilterPills } from "npm:@pagefind/modular-ui@0.12.1-beta.0";

// TODO: Replace with https://github.com/CloudCannon/pagefind/issues/226
const trimExcerpt = (excerpt, target) => {
    const words = excerpt.split(/\s/);
    let core = words.findIndex(s => s.startsWith("<mark>"));
    if (core === -1) {
        core = target/2;
    }
    const start = core - Math.floor(target * 0.2);
    const end = core + Math.floor(target * 0.8);
    const res = words.slice(
        start < 0 ? 0 : start,
        end > words.length-1 ? words.length-1 : end
    );
    return res.join(' ');
}

const search = new Instance({
    bundlePath: "/documentation/_pagefind/",
    baseUrl: "/",
    indexWeight: 2,
    mergeIndex: [
        {
            bundlePath: "https://cloudcannon.com/_pagefind/"
        }
    ]
});
window.searchInstance = search;

window.searchInput = new Input({
    containerElement: "#searchbox"
});
search.add(window.searchInput);

const searchResultTemplate = (result) => {
    const excerpt = trimExcerpt(result.excerpt, 20);
    return `<li class="result"><a class="link" href="${result.url}">
        <span class="title">${result.meta.title}</span>
        <span class="info">${result.meta.site ?? "Company"} • ... ${excerpt} ...</span>
    </a></li>`;
};

search.add(new ResultList({
    containerElement: "#searchresults",
    resultTemplate: searchResultTemplate
}));
search.add(new Summary({
    containerElement: "#summary",
    defaultMessage: "Search",
}));
search.add(new FilterPills({
    containerElement: "#searchfilter",
    filter: "site"
}));

/* Homepage search */

if (document.querySelector("#onpagesearch")) {
    const homepageSearch = new Instance({ 
        bundlePath: "/documentation/_pagefind/",
        baseUrl: "/",
    });

    homepageSearch.add(new Input({
        containerElement: "#onpagesearch"
    }));

    if (document.querySelector("#onpagesummary")) {
        homepageSearch.add(new Summary({
            containerElement: "#onpagesummary"
        }));
    }
    if (document.querySelector("#onpageresults")) {
        homepageSearch.add(new ResultList({
            containerElement: "#onpageresults",
            resultTemplate: searchResultTemplate
        }));
    }
}


let recentSearches = null, thisSearch = null;
search.on("search", (term) => {
    if (recentSearches === null) {
        try {
            recentSearches = JSON.parse(localStorage.getItem("docs-pagefind-recents")) ?? [];
        } catch {
            recentSearches = [];
        }
    }
    thisSearch = term;
    if (thisSearch?.trim?.()?.length) {
        localStorage.setItem("docs-pagefind-recents", JSON.stringify([term, ...recentSearches.filter(r => r !== thisSearch).slice(0, 4)]));
    }
});

const messageElement = document.querySelector("#searchmessage");

if (messageElement) {
    search.on("loading", () => {
        if (messageElement.innerText.trim().length) messageElement.innerText = "Loading...";
    });
    search.on("results", (results) => {
        if (!results.results.length) {
            messageElement.innerText = "No results";
        } else {
            messageElement.innerText = "";
        }
    });
}

// Prefetch links
const anchorTagElements = document.getElementsByTagName('a');
const urls = [];

[ ...anchorTagElements ].forEach(anchor => {
	anchor.addEventListener('mouseover', event => {
		const href = event.target.href;

		if (href !== undefined && !urls.includes(href)) {
			urls.push(href);
			const link = document.createElement('link');
			link.rel = 'prefetch';
			link.href = href;
			document.head.appendChild(link);
		}
	});
});