import Alpine from "npm:alpinejs@latest";
import intersect from "npm:@alpinejs/intersect@latest";
import focus from "npm:@alpinejs/focus@latest";
import ScrollPadlock from "npm:scroll-padlock@2.2.0";

const scrollElement = document.body,
  LOCKED_CLASS = "t-scroll-lock";

new ScrollPadlock(scrollElement, LOCKED_CLASS);

Alpine.plugin(intersect);
Alpine.plugin(focus);

Alpine.store("conditionals", {
  conditions: {},
  knownValues: {},
  setFromURL: null,

  register(k) {
    this.conditions[k] = {
      selected: null,
    };

    const selected_stored = localStorage.getItem(`conditional_${k}`) ?? null;

    this.select(k, selected_stored);
  },
  registerValue(k, v) {
    this.knownValues[k] = this.knownValues[k] || [];
    this.knownValues[k].push(v);

    this.updateSSGFromURL();
  },
  select(k, v) {
    this.conditions[k].selected = v;
    localStorage.setItem(`conditional_${k}`, v);
  },
  selected(k) {
    if (this.conditions[k]?.selected === "null") return null;
    return this.conditions[k]?.selected ?? null;
  },
  keys() {
    return Object.keys(this.conditions);
  },
  updateSSGFromURL() {
    const selected_in_url = new URLSearchParams(
      window?.location?.search?.toLocaleLowerCase?.() || "?"
    ).get("ssg");
    if (!selected_in_url) return;

    const matching_value = this.knownValues["ssg"]?.filter(
      (v) =>
        v.name.toLocaleLowerCase().replace(/[^a-z]/i, "") ===
        selected_in_url.replace(/[^a-z]/i, "")
    )[0];
    if (!matching_value) return;

    this.select("ssg-name", matching_value.name);
    this.select("ssg-icon", matching_value.icon);

    document
      .querySelector(".c-docs-ssg-selector")
      ?.dispatchEvent?.(
        new CustomEvent("ssgchange", { detail: {}, bubbles: true })
      );
  },
});

Alpine.magic("setNavMemory", () => {
  return () => {
    const navState = {
      scroll: document.querySelector("#t-docs-nav").scrollTop,
      opened: [...document.querySelectorAll("#t-docs-nav details")].map((d) =>
        d.hasAttribute("open")
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
    if (Date.now() - navState.time > 10000) return;

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
