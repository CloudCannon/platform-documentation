import Alpine from "https://esm.sh/alpinejs@3.14.9";
import intersect from "https://esm.sh/@alpinejs/intersect@3.14.9";
import focus from "https://esm.sh/@alpinejs/focus@3.14.9";
import ScrollPadlock from "https://esm.sh/scroll-padlock@2.2.0";

const scrollElement = document.body,
  LOCKED_CLASS = "t-scroll-lock";
new ScrollPadlock(scrollElement, LOCKED_CLASS);

Alpine.plugin(intersect);
Alpine.plugin(focus);


Alpine.data('visibleNavHighlighter', () => ({
    headings: undefined,
    visibleHeadingId: null,

    init() {
      this.$nextTick(() => {
        // Include card titles for glossary pages, standard headings for other pages
        this.headings = document.querySelectorAll('main h2, main dt[id], main dd[id], main .c-card--glossary .c-card__title[id]')
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
        const relativeTop = globalThis.innerHeight / 2

        const headingsByDistanceFromTop = {}

        this.headings.forEach(heading => {
            headingsByDistanceFromTop[heading.getBoundingClientRect().top - relativeTop] = heading
        })

        const closestNegativeTop = Math.max(...Object.keys(headingsByDistanceFromTop).filter(top => top < 0))

        if (closestNegativeTop >= 0 || [Infinity, NaN, -Infinity].includes(closestNegativeTop)) {
            this.visibleHeadingId = null
            this.updateIndicatorPosition(null)
            return
        }

        this.visibleHeadingId = headingsByDistanceFromTop[closestNegativeTop].id
        this.updateIndicatorPosition(this.visibleHeadingId)
        
        // Check if this is a letter heading (single lowercase letter) for glossary pages
        if (this.visibleHeadingId && /^[a-z]$/.test(this.visibleHeadingId)) {
            this.updateGlossaryLetter(this.visibleHeadingId)
        }
    },

    updateGlossaryLetter(letter) {
        // Update URL hash without triggering scroll
        if (globalThis.location.hash !== `#${letter}`) {
            globalThis.history.replaceState(null, '', `#${letter}`)
            globalThis.dispatchEvent(new CustomEvent('glossary-letter-changed', { detail: letter }))
        }
    },

    updateIndicatorPosition(headingId) {
        const tocList = this.$el.querySelector('.l-toc__list')
        if (!tocList) return

        if (!headingId) {
            tocList.style.setProperty('--indicator-opacity', '0')
            return
        }

        const activeLink = tocList.querySelector(`a[href="#${CSS.escape(headingId)}"]`)
        if (!activeLink) {
            tocList.style.setProperty('--indicator-opacity', '0')
            return
        }

        const listItem = activeLink.closest('li')
        if (!listItem) return

        const listRect = tocList.getBoundingClientRect()
        const itemRect = listItem.getBoundingClientRect()

        const top = itemRect.top - listRect.top + tocList.scrollTop
        const height = itemRect.height

        tocList.style.setProperty('--indicator-top', `${top}px`)
        tocList.style.setProperty('--indicator-height', `${height}px`)
        tocList.style.setProperty('--indicator-opacity', '1')

        // Auto-scroll TOC to keep active item visible
        const tocContainer = tocList.closest('.l-toc, .l-toc-glossary, .l-toc-changelog-list')
        if (tocContainer) {
            const containerRect = tocContainer.getBoundingClientRect()
            const itemRelativeTop = itemRect.top - containerRect.top
            
            // If item is outside visible area, scroll to center it
            if (itemRelativeTop < 0 || itemRelativeTop > containerRect.height - itemRect.height) {
                listItem.scrollIntoView({ block: 'center', behavior: 'smooth' })
            }
        }
    },
}))

// Scroll container state tracking for gradient indicators
Alpine.data('scrollContainer', () => ({
    scrolledDown: false,
    more: true,

    init() {
        this.$el.addEventListener('scroll', () => this.updateScrollState())
        // Also update on resize in case content changes
        new ResizeObserver(() => this.updateScrollState()).observe(this.$el)
        this.updateScrollState()
    },

    updateScrollState() {
        const el = this.$el
        // Show top gradient when scrolled more than 10px from top
        this.scrolledDown = el.scrollTop > 10
        // Show bottom gradient when not at bottom (with 10px threshold)
        this.more = el.scrollTop < el.scrollHeight - el.clientHeight - 10
    }
}))

// Center the active nav item in the sidebar
function centerActiveNavItem() {
  const nav = document.querySelector(".t-docs-nav");
  const activeItem = nav?.querySelector('[aria-current="page"]');
  if (!nav || !activeItem) return;

  // Calculate position to center the active item in the nav viewport
  const navRect = nav.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();
  const scrollTarget = nav.scrollTop + (itemRect.top - navRect.top) - (navRect.height / 2) + (itemRect.height / 2);

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

// Scroll mobile TOC to active item when opened
document.addEventListener("toggle", (e) => {
  const details = e.target;
  if (!details.open || !details.matches('.l-toc-mobile')) return;
  
  const tocList = details.querySelector('.l-toc__list');
  const activeItem = tocList?.querySelector('.active');
  if (tocList && activeItem) {
    requestAnimationFrame(() => {
      // Scroll the container, not the page
      const itemTop = activeItem.offsetTop;
      const itemHeight = activeItem.offsetHeight;
      const containerHeight = tocList.clientHeight;
      tocList.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
    });
  }
}, true); // Use capture phase since toggle doesn't bubble

// Auto-scroll nav when details expands near bottom
document.addEventListener('toggle', (e) => {
    const details = e.target;
    if (!details.open || !details.matches('.t-docs-nav details')) return;
    
    const nav = details.closest('.t-docs-nav');
    if (!nav) return;
    
    // Wait for content to render
    requestAnimationFrame(() => {
        const detailsRect = details.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        
        // If the bottom of the details is below the nav viewport, scroll to show it
        if (detailsRect.bottom > navRect.bottom) {
            // Scroll so the details is visible with some padding
            const scrollAmount = detailsRect.bottom - navRect.bottom + 20;
            nav.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
    });
}, true);

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

Alpine.magic('layoutOffsets', () => ({
  headerHeight: 64,
  announcementHeight: 0,

  init() {
    this.$nextTick(() => {
      this.measure()
      this.updateOffset()
    })
  },

  measure() {
    this.announcementHeight = this.$refs.announcement ? this.$refs.announcement.offsetHeight : 0
  },

  updateOffset() {
    const scrolled = globalThis.scrollY

    const visibleAnnouncement = Math.max(
      this.announcementHeight - scrolled,
      0
    )
    const offset = this.headerHeight + visibleAnnouncement

    document.documentElement.style
      .setProperty('--offset-height', `${offset}px`)
  }
}));

// Theme management
function getEffectiveTheme(preference) {
  if (preference === 'system' || !preference) {
    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
}

Alpine.magic('themeManager', () => ({
  initTheme() {
    this.effectiveTheme = getEffectiveTheme(this.themePreference);
    
    // Listen for OS preference changes
    globalThis.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.themePreference === 'system') {
        this.effectiveTheme = e.matches ? 'dark' : 'light';
      }
    });
  },
  
  setTheme(preference) {
    this.themePreference = preference;
    this.effectiveTheme = getEffectiveTheme(preference);
    localStorage.setItem('cc_darkMode', preference);
    // Close the popover
    document.getElementById('theme-dropdown')?.hidePopover();
  }
}));

globalThis.Alpine = Alpine;
Alpine.start();
