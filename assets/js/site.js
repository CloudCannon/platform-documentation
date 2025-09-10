import "../../_includes/scripts/alpine.js";
import {
  Instance,
  Input,
  Summary,
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

const originalElement = window.searchInput.inputEl;
const clonedElement = originalElement.cloneNode(true);
originalElement.parentNode.replaceChild(clonedElement, originalElement);

const originalClear = document.querySelector(".pagefind-modular-input-clear");
const clonedClear = originalClear.cloneNode(true);
originalClear.parentNode.replaceChild(clonedClear, originalClear);

clonedClear.addEventListener("click", e => {
  clonedElement.value = "";
  search.triggerSearch("");
  document.getElementById("searchsummary").style.display = "none";
  clonedClear.setAttribute("data-pfmod-suppressed",true);
  document.querySelector(".mobile-filters").setAttribute("data-pfmod-suppressed", "true");
})

clonedElement.placeholder = "Search this site";
clonedElement.addEventListener("input", e => {
  let query = e.target.value;
  if(query && query?.length && query?.length > 1){
    search.triggerSearch(`${query.trim()}`);
    document.querySelector(".mobile-filters").removeAttribute("data-pfmod-suppressed");
    clonedClear.removeAttribute("data-pfmod-suppressed");
  } else {
    search.triggerSearch("");
    document.querySelector(".mobile-filters").setAttribute("data-pfmod-suppressed", "true");
    clonedClear.setAttribute("data-pfmod-suppressed", "true");
  }
})

let currPage = 0;
let perPage = 10;

const templateNodes = (templateResult) => {
    if (templateResult instanceof Element) {
        return [templateResult];
    } else if (Array.isArray(templateResult) && templateResult.every(r => r instanceof Element)) {
        return templateResult;
    } else if (typeof templateResult === "string" || templateResult instanceof String) {
        let wrap = document.createElement("div");
        wrap.innerHTML = templateResult;
        return [...wrap.childNodes]
    } else {
        console.error(`[Pagefind ResultList component]: Expected template function to return an HTML element or string, got ${typeof templateResult}`);
        return [];
    }
}

const placeholderTemplate = () => {
    const placeholder = (max = 30) => {
        return ". ".repeat(Math.floor(10 + Math.random() * max));
    };
    return `<li class="pagefind-modular-list-result">
    <div class="pagefind-modular-list-thumb" data-pfmod-loading></div>
    <div class="pagefind-modular-list-inner">
        <p class="pagefind-modular-list-title" data-pfmod-loading>${placeholder(30)}</p>
        <p class="pagefind-modular-list-excerpt" data-pfmod-loading>${placeholder(40)}</p>
    </div>
</li>`;
}

const resultTemplate = (result) => {
    let wrapper = new El("li").class("pagefind-modular-list-result");

    let thumb = new El("div").class("pagefind-modular-list-thumb").addTo(wrapper);
    if (result?.meta?.image) {
        new El("img").class("pagefind-modular-list-image").attrs({
            src: result.meta.image,
            alt: result.meta.image_alt || result.meta.title
        }).addTo(thumb);
    }

    let inner = new El("div").class("pagefind-modular-list-inner").addTo(wrapper);
    let title = new El("p").class("pagefind-modular-list-title").addTo(inner);
    new El("a").class("pagefind-modular-list-link").text(result.meta?.title).attrs({
        href: result.meta?.url || result.url
    }).addTo(title);

    new El("p").class("pagefind-modular-list-excerpt").html(result.excerpt).addTo(inner);

    return wrapper.element;
}

const nearestScrollParent = (el) => {
    if (!(el instanceof HTMLElement)) return null;
    const overflowY = window.getComputedStyle(el).overflowY;
    const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';

    if (isScrollable) {
        return el;
    } else {
        return nearestScrollParent(el.parentNode);
    }
}

class ResultCustom {
    constructor(opts = {}) {
        this.rawResult = opts.result;
        this.placeholderNodes = opts.placeholderNodes;
        this.resultFn = opts.resultFn;
        this.intersectionEl = opts.intersectionEl;
        this.result = null;
        this.load();
    }

    async load() {
        if (!this.placeholderNodes?.length) return;

        this.result = await this.rawResult.data();
        const resultTemplate = this.resultFn(this.result);
        const resultNodes = templateNodes(resultTemplate);

        while (this.placeholderNodes.length > 1) {
            this.placeholderNodes.pop().remove();
        }

        this.placeholderNodes[0].replaceWith(...resultNodes);
    }
}

class ResultListCustom {
    constructor(opts) {
        this.intersectionEl = document.body;
        this.containerEl = null;
        this.results = [];
        this.placeholderTemplate = opts.placeholderTemplate ?? placeholderTemplate;
        this.resultTemplate = opts.resultTemplate ?? resultTemplate;

        if (opts.containerElement) {
            this.initContainer(opts.containerElement);
        } else {
            console.error(`[Pagefind ResultList component]: No selector supplied for containerElement`);
            return;
        }
    }

    initContainer(selector) {
        const container = document.querySelector(selector);
        if (!container) {
            console.error(`[Pagefind ResultList component]: No container found for ${selector} selector`);
            return;
        }

        this.containerEl = container;
    }

    append(nodes) {
        for (const node of nodes) {
            this.containerEl.appendChild(node);
        }
    }

    register(instance) {
        instance.on("results", (results) => {
            if (!this.containerEl) return;
            this.containerEl.innerHTML = "";
            let totalLength = results.results.length;
            let pageResults = results.results.slice(currPage * perPage,(currPage+1)*perPage);
            let endResults = (currPage+1)*perPage < totalLength ? (currPage+1)*perPage : totalLength;

            if(totalLength > 0){
              document.getElementById("searchsummary").style.display = "block"
              document.getElementById("searchsummary").innerHTML = `Showing ${(currPage*perPage)+1} - ${endResults} of ${totalLength} results for <b>${instance.searchTerm}</b>`
            }

            this.results = pageResults.map(r => {
                let placeholderNodes = templateNodes(this.placeholderTemplate());
                this.append(placeholderNodes);
                return new ResultCustom({ result: r, placeholderNodes, resultFn: this.resultTemplate, intersectionEl: this.intersectionEl });
            })
        });

        instance.on("loading", () => {
            if (!this.containerEl) return;
            this.containerEl.innerHTML = "";
        });
    }
}


const searchResultTemplate = (result) => {
  let base_title = result.meta.title;
  if (result.meta.guide_title) {
    base_title = `${result.meta.guide_title} • ${base_title}`;
  }

  let base_result = `<li class="result base"><a class="link" href="${result.url}">
    <span class="section">${result.meta.site}</span>
    <span class="title">${base_title}</span>
  `;

  const has_root_result = !result.sub_results[0].anchor;
  if (has_root_result) {
    const root_result = result.sub_results.shift();
    base_result = `<li class="result base"><a class="link" href="${root_result.url}">
      <span class="section">${result.meta.site}</span>
      <span class="title">${base_title}</span>
      <span class="info">${root_result.excerpt}</span>
    `;
  }

  result.sub_results.sort((a, b) => b.locations.length - a.locations.length);

  const subs = result.sub_results.slice(0, 3).map((sub) => {
    return `
      <span class="info">${sub.excerpt}</span>
    `;
  });
  return base_result + subs.join("\n") + `</a></li>`;
};

search.add(
  new ResultListCustom({
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
        this.selected = ["Documentation"];
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
                this.selected = ["Documentation"];
            } else if (this.selected?.length > 1) {
                this.selected = this.selected.filter(v => v !== "All");
            }
            currPage = 0;
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
        instance.searchFilters = {"site":["Documentation"]} // change this maybe?
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
            let total = this.available.reduce(function (acc, obj) { return acc + obj[1]; }, 0);
            this.available.push(["All", total]);
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

document.querySelector(".mobile-filters").addEventListener("click", e => {
  document.getElementById("searchfilter").classList.toggle("open");
})

search.add(
  new FilterPillsCustom({
    containerElement: "#searchfilter",
    filter: "site",
    ordering: ["Documentation","Guides","Changelog","All"]
  })
);

/*
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
});*/

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

function makePaginationBox(pagination,text,num = text)
{
  let box = document.createElement("div");
  box.classList.add("pagination-box");
  if(currPage+1 == num)
    box.classList.add("active");

  box.innerHTML = text;
  box.addEventListener("click", e => {
    currPage = num-1;
    search.triggerSearch(search.searchTerm);
  })
  pagination.append(box);
  return box;
}

search.on("results", (results) => {
  let pagination = document.getElementById("searchpagination");
  pagination.innerHTML = "";
  if(results.results.length > 0){
    document.getElementById("searchcontainer").classList.add("has-results");
    pagination.classList.add("show");
    let pages = Math.ceil(results.results.length / perPage);

    /* FIGURE OUT HOW TO MAKE THIS BETTER */
    if(pages > 1 && currPage != 0)
    {
      let prevbox = makePaginationBox(pagination,"",currPage); // prev
      let prevsvg = document.createElement("img");
      prevsvg.src = "https://cdn.jsdelivr.net/npm/@material-design-icons/svg@0.14.15/outlined/arrow_back_ios.svg"
      prevsvg.setAttribute("inline", '');
      prevbox.append(prevsvg);
    }

    if(pages > 1 && pages <= 7)
    {
      for(let i=1;i<=pages;i++)
        makePaginationBox(pagination,i);
    }
    else if(pages >= 8)
    {
      // first 2
      makePaginationBox(pagination,1);
      makePaginationBox(pagination,2);

      // middle numbers
      if(currPage < 4){
        makePaginationBox(pagination,3);
        makePaginationBox(pagination,4);
        makePaginationBox(pagination,"…",5);
      }
      else if(currPage >= pages-4)
      {
        makePaginationBox(pagination,"…",pages-4);
        makePaginationBox(pagination,pages-3);
        makePaginationBox(pagination,pages-2);
      }
      else
      {
        makePaginationBox(pagination,"…",currPage);
        makePaginationBox(pagination,currPage+1);
        makePaginationBox(pagination,"…",currPage+2);
      }

      // last 2
      makePaginationBox(pagination,pages-1);
      makePaginationBox(pagination,pages);
    }

    if(pages > 1 && currPage != pages-1)
    {
      let nextbox = makePaginationBox(pagination,"",currPage+2); // next
      let nextsvg = document.createElement("img");
      nextsvg.src = "https://cdn.jsdelivr.net/npm/@material-design-icons/svg@0.14.15/outlined/arrow_forward_ios.svg"
      nextsvg.setAttribute("inline", '');
      nextbox.append(nextsvg);
    }
  }
  else{
    currPage = 0;
    document.getElementById("searchcontainer").classList.remove("has-results");
    pagination.classList.remove("show");
  }
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
