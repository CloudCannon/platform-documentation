import Alpine from "npm:alpinejs@latest";
import intersect from "npm:@alpinejs/intersect@latest";
import focus from "https://esm.sh/@alpinejs/focus@latest";
import ScrollPadlock from "npm:scroll-padlock@2.2.0";

const scrollElement = document.body,
  LOCKED_CLASS = "t-scroll-lock";
new ScrollPadlock(scrollElement, LOCKED_CLASS);

Alpine.plugin(intersect);
Alpine.plugin(focus);


Alpine.magic('visibleNavHighlighter', (el, { Alpine }) => ({
    headings: undefined,
    visibleHeadingId: null,

    init() {
      this.$nextTick(() => {
        this.headings = document.querySelectorAll('main h2, main h3')
        this.assignHeadingIds()
        this.onScroll()
      })
    },

    assignHeadingIds() {
        this.headings.forEach(heading => {
            if (heading.id) return

            heading.id = heading.textContent.replace(/\s+/g, '-').toLowerCase()
        })
    },

    onScroll() {
        let relativeTop = window.innerHeight / 2

        let headingsByDistanceFromTop = {}

        this.headings.forEach(heading => {
            console.log(heading,heading.getBoundingClientRect(),relativeTop)
            headingsByDistanceFromTop[heading.getBoundingClientRect().top - relativeTop] = heading
        })

        console.log(headingsByDistanceFromTop)

        let closestNegativeTop = Math.max(...Object.keys(headingsByDistanceFromTop).filter(top => top < 0))


        if (closestNegativeTop >= 0 || [Infinity, NaN, -Infinity].includes(closestNegativeTop)) return this.visibleHeadingId = null

        this.visibleHeadingId = headingsByDistanceFromTop[closestNegativeTop].id
    },
}))

Alpine.magic("setNavMemory", () => {
  return () => {
    const navState = {
      scroll: document.querySelector("#t-docs-nav").scrollTop,
      opened: [...document.querySelectorAll("#t-docs-nav details")].map((d) =>
        d.hasAttribute("open") && d.getAttribute("open") == true
      ),
      time: Date.now(),
    };
    localStorage.setItem("nav_memory", JSON.stringify(navState));
  };
});

Alpine.magic("getNavMemory", () => {
  return () => {
    let navState = localStorage.getItem("nav_memory");
    if (!navState) return;
    navState = JSON.parse(navState);
    // Only persist nav on immediate page navigations
    //if (Date.now() - navState.time > 10000) return;

    [...document.querySelectorAll("#t-docs-nav details")].forEach(
      (d, index) => {
        if (navState.opened[index]) {
          d.setAttribute("open", "true");
        }
      }
    );

    const el = document.querySelector("#t-docs-nav");
    el.scrollTop = navState.scroll;
  };
});

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
      let recents =
        JSON.parse(localStorage.getItem("docs-pagefind-recents")) ?? [];
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
    window.searchInstance.triggerSearch(term);
  };
});

Alpine.magic("clipboard", (el) => {
  return async (code) => {
    const toastMessage = el.nextElementSibling;
    toastMessage.classList.remove("active");
    await navigator.clipboard.writeText(decodeURIComponent(atob(code)));
    toastMessage.classList.add("active");
    let timer = setTimeout(function () {
      copied = toastMessage.classList.remove("active");
      timer = null;
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
      window?.searchInput?.focus?.();
      setTimeout(() => {
        window?.searchInput?.focus?.();
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

window.Alpine = Alpine;
Alpine.start();
