// Load popover polyfill for browsers that don't support it natively
if (!("popover" in HTMLElement.prototype)) {
  import("https://esm.sh/@oddbird/popover-polyfill@0.6.1");
}

import "../../_includes/scripts/alpine.js";

// Progressive enhancement: relative date formatting
// Converts <time data-relative-date> elements to show "X days ago" for recent dates
document.querySelectorAll("time[data-relative-date]").forEach((el) => {
  const date = new Date(el.getAttribute("datetime"));
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth());

  // Only show relative dates for entries less than 5 months old
  if (diffMonths < 5) {
    if (diffDays === 0) {
      el.textContent = "today";
    } else if (diffDays === 1) {
      el.textContent = "1 day ago";
    } else if (diffDays < 7) {
      el.textContent = `${diffDays} days ago`;
    } else if (diffDays < 14) {
      el.textContent = "1 week ago";
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      el.textContent = `${weeks} weeks ago`;
    } else if (diffMonths === 1) {
      el.textContent = "1 month ago";
    } else {
      el.textContent = `${diffMonths} months ago`;
    }
  }
  // Otherwise keep the formatted date fallback
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
