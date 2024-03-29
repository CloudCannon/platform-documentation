import "../../_includes/scripts/alpine.js";
import {
  Instance,
  Input,
  ResultList,
  Summary,
  FilterPills,
} from "npm:@pagefind/modular-ui@1.0.3";

const search = new Instance({
  bundlePath: "/documentation/_pagefind/",
  baseUrl: "/",
  indexWeight: 2,
  excerptLength: 15,
  // mergeIndex: [
  //   {
  //     bundlePath: "https://cloudcannon.com/_pagefind/",
  //   },
  // ],
});
window.searchInstance = search;

window.searchInput = new Input({
  containerElement: "#searchbox",
});
search.add(window.searchInput);

const searchResultTemplate = (result) => {
  let base_title = result.meta.title;
  if (result.meta.guide_title) {
    base_title = `${result.meta.guide_title} • ${base_title}`;
  }

  let base_result = `<li class="result base"><a class="link" href="${result.url}">
    <span class="section">${result.meta.site}</span>
    <span class="title">${base_title}</span>
  </a></li>`;

  const has_root_result = !result.sub_results[0].anchor;
  if (has_root_result) {
    const root_result = result.sub_results.shift();
    base_result = `<li class="result base"><a class="link" href="${root_result.url}">
      <span class="section">${result.meta.site}</span>
      <span class="title">${base_title}</span>
      <span class="info">${root_result.excerpt}</span>
    </a></li>`;
  }

  result.sub_results.sort((a, b) => b.locations.length - a.locations.length);

  const subs = result.sub_results.slice(0, 3).map((sub) => {
    return `<li class="result sub"><a class="link" href="${sub.url}">
      <span class="title">${sub.title}
      <span class="info">${sub.excerpt}</span>
    </a></li>`;
  });
  return base_result + subs.join("\n");
};

search.add(
  new ResultList({
    containerElement: "#searchresults",
    resultTemplate: searchResultTemplate,
  })
);
search.add(
  new Summary({
    containerElement: "#summary",
    defaultMessage: "Search",
  })
);
search.add(
  new FilterPills({
    containerElement: "#searchfilter",
    filter: "site",
  })
);

let recentSearches = null,
  thisSearch = null;
search.on("search", (term) => {
  if (recentSearches === null) {
    try {
      recentSearches =
        JSON.parse(localStorage.getItem("docs-pagefind-recents")) ?? [];
    } catch {
      recentSearches = [];
    }
  }
  thisSearch = term;
  if (thisSearch?.trim?.()?.length) {
    localStorage.setItem(
      "docs-pagefind-recents",
      JSON.stringify([
        term,
        ...recentSearches.filter((r) => r !== thisSearch).slice(0, 4),
      ])
    );
  }
});

const messageElement = document.querySelector("#searchmessage");

if (messageElement) {
  search.on("loading", () => {
    if (messageElement.innerText.trim().length)
      messageElement.innerText = "Loading...";
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
const anchorTagElements = document.getElementsByTagName("a");
const urls = [];

[...anchorTagElements].forEach((anchor) => {
  anchor.addEventListener("mouseover", (event) => {
    const href = event.target.href;

    if (href !== undefined && !urls.includes(href)) {
      urls.push(href);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    }
  });
});
