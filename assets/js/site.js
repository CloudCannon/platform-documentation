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

window.searchInput.inputEl.placeholder = "Search this site"

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

// copied from pagefind core and modified
class FilterPillsCustom {
    constructor(opts = {}) {
        this.instance = null;
        this.wrapper = null;
        this.pillContainer = null;
        this.available = {};
        this.selected = ["All"];
        this.total = 0;
        this.filterMemo = "";

        this.filter = opts.filter;
        this.ordering = opts.ordering ?? null;
        this.alwaysShow = opts.alwaysShow ?? false;
        this.selectMultiple = opts.selectMultiple ?? false;

        if (!this.filter?.length) {
            console.error(`[Pagefind FilterPills component]: No filter option supplied, nothing to display`);
            return;
        }

        if (opts.containerElement) {
            this.initContainer(opts.containerElement);
        } else {
            console.error(`[Pagefind FilterPills component]: No selector supplied for containerElement`);
            return;
        }
    }

    initContainer(selector) {
        const container = document.querySelector(selector);
        if (!container) {
            console.error(`[Pagefind FilterPills component]: No container found for ${selector} selector`);
            return;
        }
        container.innerHTML = "";
        const id = `pagefind_modular_filter_pills_${this.filter}`;

        const wrapper = document.createElement("div");
        wrapper.classList.add("pagefind-modular-filter-pills-wrapper")
        wrapper.setAttribute("role","group")
        wrapper.setAttribute("aria-labelledby",id)

        if (!this.alwaysShow) {
            wrapper.setAttribute("data-pfmod-hidden",true)
        }

        let heading = document.createElement("h3")
        heading.innerText = "Category"
        wrapper.append(heading)
        
        let div = document.createElement("div")
        div.id = id
        div.classList.add("pagefind-modular-filter-pills-label")
        div.setAttribute("data-pfmod-sr-hidden",true)
        div.innerText = `Filter results by ${this.filter}`
        
        wrapper.append(div)

        this.pillContainer = document.createElement("div")
        this.pillContainer.classList.add("pagefind-modular-filter-pills")
        wrapper.append(this.pillContainer)

        this.wrapper = wrapper
        container.append(wrapper)
    }

    update() {
        const filterMemo = this.available.map(a => a[0]).join("~");
        if (filterMemo == this.filterMemo) {
            this.updateExisting();
        } else {
            this.renderNew();
            this.filterMemo = filterMemo;
        }
    }

    pushFilters() {
        const selected = this.selected.filter(v => v !== "All");
        this.instance.triggerFilter(this.filter, selected);
    }

    pillInner(val, count) {
        if (this.total) {
            return `<span aria-label="${val}"><span class="filter_val">${val}</span><span class="filter_count">${count}</span></span>`;
        } else {
            return `<span aria-label="${val}">${val}</span>`;
        }
    }

    renderNew() {
        this.available.forEach(([val, count]) => {
          let button = document.createElement("button")
          button.classList.add("pagefind-modular-filter-pill")
          button.innerHTML = this.pillInner(val, count)
          button.setAttribute("aria-pressed",this.selected.includes(val))
          button.setAttribute("type","button")

          button.addEventListener("click", () => {
            if (val === "All") {
                this.selected = ["All"];
            } else if (this.selected.includes(val)) {
                this.selected = this.selected.filter(v => v !== val);
            } else if (this.selectMultiple) {
                this.selected.push(val);
            } else {
                this.selected = [val];
            }
            if (!this.selected?.length) {
                this.selected = ["All"];
            } else if (this.selected?.length > 1) {
                this.selected = this.selected.filter(v => v !== "All");
            }
            this.update();
            this.pushFilters();
        })
        this.pillContainer.append(button)
      });
    }

    updateExisting() {
        const pills = [...this.pillContainer.childNodes];
        this.available.forEach(([val, count], i) => {
            pills[i].innerHTML = this.pillInner(val, count);
            pills[i].setAttribute("aria-pressed", this.selected.includes(val));
        });
    }

    register(instance) {
        this.instance = instance;
        this.instance.on("filters", (filters) => {
            if (!this.pillContainer) return;

            if (this.selectMultiple) {
                filters = filters.available;
            } else {
                filters = filters.total;
            }

            let newlyAvailable = filters[this.filter];
            if (!newlyAvailable) {
                console.warn(`[Pagefind FilterPills component]: No possible values found for the ${this.filter} filter`);
                return;
            }
            this.available = Object.entries(newlyAvailable);

            if (Array.isArray(this.ordering)) {
                this.available.sort((a, b) => {
                    const apos = this.ordering.indexOf(a[0]);
                    const bpos = this.ordering.indexOf(b[0]);
                    return (apos === -1 ? Infinity : apos) - (bpos === -1 ? Infinity : bpos);
                });
            } else {
                this.available.sort((a, b) => {
                    return a[0].localeCompare(b[0]);
                });
            }
            this.available.unshift(["All", this.total]);
            this.update();
        });

        instance.on("results", (results) => {
            if (!this.pillContainer) return;
            this.total = results?.unfilteredResultCount || 0;

            if (this.available?.[0]?.[0] === "All") {
                this.available[0][1] = this.total;
            }

            if (this.total || this.alwaysShow) {
                this.wrapper.removeAttribute("data-pfmod-hidden");
            } else {
                this.wrapper.setAttribute("data-pfmod-hidden", "true");
            }
            this.update();
        });
    }
}

search.add(
  new FilterPillsCustom({
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

search.on("results", (results) => {
    if(results.results.length > 0)
      document.getElementById("searchcontainer").classList.add("has-results")
    else
      document.getElementById("searchcontainer").classList.remove("has-results")
});

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
