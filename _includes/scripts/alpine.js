import Alpine from "https://esm.sh/alpinejs@3.14.9";
import intersect from "https://esm.sh/@alpinejs/intersect@3.14.9";
import focus from "https://esm.sh/@alpinejs/focus@3.14.9";
import ScrollPadlock from "https://esm.sh/scroll-padlock@2.2.0";

const scrollElement = document.body,
  LOCKED_CLASS = "t-scroll-lock";
new ScrollPadlock(scrollElement, LOCKED_CLASS);

Alpine.plugin(intersect);
Alpine.plugin(focus);

Alpine.data("visibleNavHighlighter", () => ({
  headings: undefined,
  visibleHeadingId: null,

  init() {
    this.$nextTick(() => {
      // Include card titles for glossary pages, standard headings for other pages
      this.headings = document.querySelectorAll(
        "main h2:not(.glossary-letter-heading), main dt[id], main .c-data-reference__item[id], main .c-card--glossary .c-card__title[id]",
      );
      this.assignHeadingIds();
      this.onScroll();
    });
  },

  assignHeadingIds() {
    this.headings.forEach((heading) => {
      if (heading.id) return;

      heading.id = heading.textContent.replace(/\s+/g, "-").toLowerCase();
    });
  },

  onScroll() {
    if (!this.headings) {
      return;
    }

    const offsetHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--offset-height",
      ) || "64",
      10,
    );
    const relativeTop = offsetHeight + 48;

    const headingsByDistanceFromTop = {};

    this.headings.forEach((heading) => {
      headingsByDistanceFromTop[
        heading.getBoundingClientRect().top - relativeTop
      ] = heading;
    });

    const closestNegativeTop = Math.max(
      ...Object.keys(headingsByDistanceFromTop).filter((top) => top < 0),
    );

    if (
      closestNegativeTop >= 0 ||
      [Infinity, NaN, -Infinity].includes(closestNegativeTop)
    ) {
      this.visibleHeadingId = null;
      this.updateIndicatorPosition(null);
      // At top of page: find closest heading to viewport top for glossary
      const tops = Object.keys(headingsByDistanceFromTop).map(Number);
      if (tops.length > 0) {
        const closestTop = Math.min(...tops);
        const closestHeading = headingsByDistanceFromTop[closestTop];
        if (closestHeading) {
          globalThis.dispatchEvent(
            new CustomEvent("glossary-letter-changed", {
              detail: closestHeading.id.charAt(0).toLowerCase(),
            }),
          );
        }
      }
      return;
    }

    this.visibleHeadingId = headingsByDistanceFromTop[closestNegativeTop].id;
    this.updateIndicatorPosition(this.visibleHeadingId);

    if (this.visibleHeadingId) {
      globalThis.dispatchEvent(
        new CustomEvent("glossary-letter-changed", {
          detail: this.visibleHeadingId.charAt(0).toLowerCase(),
        }),
      );
    }
  },

  updateIndicatorPosition(headingId) {
    const tocList = this.$el.querySelector(".l-toc__list");
    if (!tocList) {
      return;
    }

    if (!headingId) {
      tocList.style.setProperty("--indicator-opacity", "0");
      return;
    }

    const activeLink = tocList.querySelector(
      `a[href="#${CSS.escape(headingId)}"]`,
    );
    if (!activeLink) {
      tocList.style.setProperty("--indicator-opacity", "0");
      return;
    }

    const listItem = activeLink.closest("li");
    if (!listItem) {
      return;
    }

    const listRect = tocList.getBoundingClientRect();
    const itemRect = listItem.getBoundingClientRect();

    const top = itemRect.top - listRect.top + tocList.scrollTop;
    const height = itemRect.height;

    tocList.style.setProperty("--indicator-top", `${top}px`);
    tocList.style.setProperty("--indicator-height", `${height}px`);
    tocList.style.setProperty("--indicator-opacity", "1");

    // Auto-scroll TOC to keep active item visible
    const tocContainer = tocList.closest(
      ".l-toc, .l-toc-glossary, .l-toc-changelog-list",
    );

    if (tocContainer) {
      const containerRect = tocContainer.getBoundingClientRect();
      const itemRelativeTop = itemRect.top - containerRect.top;

      // If item is outside visible area, scroll to center it
      if (
        itemRelativeTop < 0 ||
        itemRelativeTop > containerRect.height - itemRect.height
      ) {
        listItem.scrollIntoView({
          block: "center",
          behavior: "smooth",
          container: "nearest",
        });
      }
    }
  },
}));

// Glossary nav: active letter from closest visible glossary heading (scroll-driven), not from hash
// Listens to glossary-letter-changed events dispatched by visibleNavHighlighter
Alpine.data("glossaryNav", () => ({
  active: "#a",
  height: 0,
  scrollHeight: 0,

  init() {
    const navParent = this.$el.closest(".t-docs-nav");
    if (navParent) {
      new ResizeObserver(() => {
        this.height = navParent.getBoundingClientRect().height;
        this.scrollHeight = navParent.scrollHeight;
      }).observe(this.$el);
    }

    // Listen for glossary letter changes from visibleNavHighlighter (single source of truth)
    globalThis.addEventListener("glossary-letter-changed", (e) => {
      const letter = e.detail;
      const next = "#" + letter;
      if (this.active !== next) {
        this.active = next;
        this.scrollActiveIntoView();
      }
    });
  },

  scrollActiveIntoView() {
    const activeEl = this.$el.querySelector(
      `[href$="#${this.active.slice(1)}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
        container: "nearest",
      });
    }
  },
}));

// Scroll container state tracking for gradient indicators
Alpine.data("scrollContainer", () => ({
  scrolledDown: false,
  more: true,

  init() {
    this.$el.addEventListener("scroll", () => this.updateScrollState());
    // Also update on resize in case content changes
    new ResizeObserver(() => this.updateScrollState()).observe(this.$el);
    this.updateScrollState();
  },

  updateScrollState() {
    const el = this.$el;
    // Show top gradient when scrolled more than 10px from top
    this.scrolledDown = el.scrollTop > 10;
    // Show bottom gradient when not at bottom (with 10px threshold)
    this.more = el.scrollTop < el.scrollHeight - el.clientHeight - 10;
  },
}));

// Center the active nav item in the sidebar
function centerActiveNavItem() {
  const nav = document.querySelector(".t-docs-nav");
  const activeItem = nav?.querySelector('[aria-current="page"]');
  if (!nav || !activeItem) return;

  // Calculate position to center the active item in the nav viewport
  const navRect = nav.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();
  const scrollTarget = nav.scrollTop + (itemRect.top - navRect.top) -
    (navRect.height / 2) + (itemRect.height / 2);

  nav.scrollTop = Math.max(0, scrollTarget);
}

// Center active nav item on page load
document.addEventListener("DOMContentLoaded", centerActiveNavItem);

// Also center on view transitions (pagereveal fires on new page)
globalThis.addEventListener?.("pagereveal", centerActiveNavItem);

// Close mobile TOC when a link is clicked
document.addEventListener("click", (e) => {
  const link = e.target.closest(".l-toc-mobile a");
  if (link) {
    link.closest("details")?.removeAttribute("open");
  }
});

// Handle toggle events for details elements
document.addEventListener("toggle", (e) => {
  const details = e.target;
  if (!details.open) return;

  // Scroll mobile TOC to active item when opened
  if (details.matches(".l-toc-mobile")) {
    const tocList = details.querySelector(".l-toc__list");
    const activeItem = tocList?.querySelector(".active");
    if (tocList && activeItem) {
      requestAnimationFrame(() => {
        const itemTop = activeItem.offsetTop;
        const itemHeight = activeItem.offsetHeight;
        const containerHeight = tocList.clientHeight;
        tocList.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
      });
    }
    return;
  }

  // Auto-scroll nav when details expands near bottom
  if (details.matches(".t-docs-nav details")) {
    const nav = details.closest(".t-docs-nav");
    if (!nav) return;

    requestAnimationFrame(() => {
      const detailsRect = details.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const header = document.querySelector(".l-nav");
      const headerHeight = header?.getBoundingClientRect().height ?? 0;

      // The effective top of the visible nav area (below the sticky header)
      const visibleNavTop = Math.max(navRect.top, headerHeight);

      // Only scroll if the bottom is cut off
      if (detailsRect.bottom > navRect.bottom) {
        // How much we'd need to scroll to show the bottom
        const neededForBottom = detailsRect.bottom - navRect.bottom + 20;
        // How much we can scroll without pushing the top behind the header
        const maxScroll = detailsRect.top - visibleNavTop - 10;
        // Scroll the lesser - either show all, or as much as fits from top down
        const scrollAmount = Math.min(neededForBottom, Math.max(0, maxScroll));

        if (scrollAmount > 0) {
          nav.scrollBy({
            top: scrollAmount,
            behavior: "smooth",
            container: "nearest",
          });
        }
      }
    });
  }
}, true); // Use capture phase since toggle doesn't bubble

const RECENTS_KEY = "docs-pagefind-recents";
const RECENTS_MAX = 5;

function readRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function writeRecents(recents) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
  } catch {
    // Ignore quota / private mode errors.
  }
}

Alpine.store("search", {
  hasQuery: false,
  hasFocus: false,
  selectedFilter: "",
  recents: readRecents(),
});

function isPagefindInputFocused() {
  const active = document.activeElement;
  return !!active && typeof active.closest === "function" &&
    active.closest("pagefind-input") !== null;
}

function refreshSearchFocus() {
  const store = Alpine.store("search");
  const now = isPagefindInputFocused();
  if (store.hasFocus !== now) store.hasFocus = now;
}

document.addEventListener("focusin", refreshSearchFocus);
document.addEventListener("focusout", () => {
  requestAnimationFrame(refreshSearchFocus);
});

// Multiplier applied to changelog result scores before sort. Scales the score
// down proportionally so changelogs are deprioritised in mixed results but
// still surface when they are the only strong match.
const CHANGELOG_SCORE_MULTIPLIER = 0.5;

function wrapPagefindSearch(instance) {
  const pagefind = instance?.__pagefind__;
  if (!pagefind || pagefind.__docsRescoreWrapped) return false;
  const origSearch = pagefind.search.bind(pagefind);
  pagefind.search = async (term, opts) => {
    const res = await origSearch(term, opts);
    if (!res?.results?.length) return res;
    await Promise.all(res.results.map(async (r) => {
      try {
        const d = await r.data();
        r._isChangelog = d?.meta?.site === "Changelog" ||
          (d?.filters?.site || []).includes("Changelog") ||
          /\/changelog\//.test(d?.url || "");
      } catch {
        r._isChangelog = false;
      }
    }));
    res.results.sort((a, b) => {
      const as = a.score * (a._isChangelog ? CHANGELOG_SCORE_MULTIPLIER : 1);
      const bs = b.score * (b._isChangelog ? CHANGELOG_SCORE_MULTIPLIER : 1);
      return bs - as;
    });
    return res;
  };
  pagefind.__docsRescoreWrapped = true;
  return true;
}

function setupPagefindInstance(attempt = 0) {
  const im = globalThis.PagefindComponents?.getInstanceManager?.();
  const instance = im?.getInstance?.("default");
  if (!instance) {
    if (attempt < 50) setTimeout(() => setupPagefindInstance(attempt + 1), 100);
    return;
  }
  globalThis.searchInstance = instance;
  if (!wrapPagefindSearch(instance)) {
    const retry = (a = 0) => {
      if (wrapPagefindSearch(instance) || a >= 50) return;
      setTimeout(() => retry(a + 1), 100);
    };
    retry();
  }
  instance.on("search", (term, filters) => {
    const trimmed = typeof term === "string" ? term.trim() : "";
    const store = Alpine.store("search");
    store.hasQuery = trimmed.length > 0;
    const sel = filters?.site;
    store.selectedFilter = Array.isArray(sel) && sel.length ? sel[0] : "";
    if (trimmed.length > 0) {
      const next = [
        trimmed,
        ...store.recents.filter((r) => r !== trimmed),
      ].slice(0, RECENTS_MAX);
      store.recents = next;
      writeRecents(next);
    } else {
      store.recents = readRecents();
    }
  });
}
setupPagefindInstance();

Alpine.data("searchPills", () => ({
  filters: {},
  selected: "",
  init() {
    const wait = (attempt = 0) => {
      const inst = globalThis.searchInstance;
      if (!inst) {
        if (attempt < 50) setTimeout(() => wait(attempt + 1), 100);
        return;
      }
      inst.on("filters", (data) => {
        // Prefer `total` — counts per category ignoring the currently applied
        // site filter, so switching pills reflects what results you'd get.
        // Fall back to `available` if `total` isn't populated for this index.
        this.filters = data?.total?.site || data?.available?.site || {};
      });
      inst.on("search", (_term, filters) => {
        const sel = filters?.site;
        this.selected = Array.isArray(sel) && sel.length ? sel[0] : "";
      });
    };
    wait();
  },
  entries() {
    const preferred = ["Articles", "Guides", "Reference", "Changelog"];
    const all = Object.entries(this.filters || {});
    return all.sort((a, b) => {
      const ai = preferred.indexOf(a[0]);
      const bi = preferred.indexOf(b[0]);
      if (ai === -1 && bi === -1) return a[0].localeCompare(b[0]);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  },
  totalCount() {
    return Object.values(this.filters || {}).reduce((s, v) => s + (v || 0), 0);
  },
  setFilter(value) {
    const inst = globalThis.searchInstance;
    if (!inst?.triggerFilter) return;
    this.selected = value;
    inst.triggerFilter("site", value ? [value] : []);
  },
}));

Alpine.data("searchRecents", () => ({
  triggerRecent(term) {
    // Find the pagefind-input that shares an ancestor with this recents block
    // (so the modal's recents drive the modal's input, and the inline recents
    // drive the inline input). Fall back to the first one in the document,
    // then to triggerSearch as a last resort.
    let inputEl = null;
    let ancestor = this.$root;
    while (ancestor && !inputEl) {
      inputEl = ancestor.querySelector?.("pagefind-input input");
      ancestor = ancestor.parentElement;
    }
    if (!inputEl) inputEl = document.querySelector("pagefind-input input");
    if (inputEl) {
      inputEl.value = term;
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    globalThis.searchInstance?.triggerSearch?.(term);
  },
  removeRecent(term) {
    const store = Alpine.store("search");
    store.recents = store.recents.filter((r) => r !== term);
    writeRecents(store.recents);
  },
}));

Alpine.magic("getRecentSearches", () => {
  return () => {
    try {
      return JSON.parse(localStorage.getItem("docs-pagefind-recents")) ?? [];
    } catch {
      return [];
    }
  };
});

Alpine.magic("deleteRecentSearch", () => {
  return (recent) => {
    try {
      let recents = JSON.parse(localStorage.getItem("docs-pagefind-recents")) ??
        [];
      recents = recents.filter((r) => r !== recent);
      localStorage.setItem("docs-pagefind-recents", JSON.stringify(recents));
      return recents;
    } catch {
      return [];
    }
  };
});

Alpine.magic("triggerSearch", () => {
  return (term) => {
    globalThis.searchInstance.triggerSearch(term);
  };
});

Alpine.magic("clipboard", (el) => {
  return async (code) => {
    const toastMessage = el.nextElementSibling;
    toastMessage.classList.remove("active");
    await navigator.clipboard.writeText(decodeURIComponent(atob(code)));
    toastMessage.classList.add("active");
    const _timer = setTimeout(function () {
      toastMessage.classList.remove("active");
    }, 2000);
  };
});

Alpine.magic("isLoggedIn", () => {
  return /^(.*;)?\s*signed_in\s*=\s*[^;]+(.*)?$/.test(document.cookie);
});

Alpine.magic("platformMac", () => {
  return /mac/i.test(navigator.userAgentData?.platform || navigator.platform);
});

Alpine.magic("focusSearch", () => {
  return (isModalOpen) => {
    if (isModalOpen) {
      scrollElement.classList.add(LOCKED_CLASS);
      globalThis?.searchInput?.focus?.();
      setTimeout(() => {
        globalThis?.searchInput?.focus?.();
      }, 100);
    } else {
      scrollElement.classList.remove(LOCKED_CLASS);
    }
  };
});

Alpine.magic("focusNav", () => {
  return (isNavOpen) => {
    if (isNavOpen) {
      scrollElement.classList.add(LOCKED_CLASS);
    } else {
      scrollElement.classList.remove(LOCKED_CLASS);
    }
  };
});

Alpine.magic("layoutOffsets", () => ({
  headerHeight: 64,
  announcementHeight: 0,

  init() {
    this.$nextTick(() => {
      this.measure();
      this.updateOffset();
    });
  },

  measure() {
    this.announcementHeight = this.$refs.announcement
      ? this.$refs.announcement.offsetHeight
      : 0;
  },

  updateOffset() {
    const scrolled = globalThis.scrollY;

    const visibleAnnouncement = Math.max(
      this.announcementHeight - scrolled,
      0,
    );
    const offset = this.headerHeight + visibleAnnouncement;

    document.documentElement.style
      .setProperty("--offset-height", `${offset}px`);
  },
}));

// Theme management
function getEffectiveTheme(preference) {
  if (preference === "system" || !preference) {
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

Alpine.magic("themeManager", () => ({
  initTheme() {
    this.effectiveTheme = getEffectiveTheme(this.themePreference);

    // Listen for OS preference changes
    globalThis.matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      (e) => {
        if (this.themePreference === "system") {
          this.effectiveTheme = e.matches ? "dark" : "light";
        }
      },
    );
  },

  setTheme(preference) {
    this.themePreference = preference;
    this.effectiveTheme = getEffectiveTheme(preference);
    localStorage.setItem("cc_darkMode", preference);
    // Close the popover
    document.querySelector(".theme-dropdown:popover-open")?.hidePopover();
  },
}));

globalThis.Alpine = Alpine;
Alpine.start();
