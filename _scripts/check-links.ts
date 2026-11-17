import { DOMParser } from "@b-fuze/deno-dom";
import { walk } from "@std/fs";
import { relative } from "@std/path";
import { LinkChecker } from "linkinator";
import routing from "../.cloudcannon/routing.json" with { type: "json" };

const SITE_DIR = "_site";
const LIVE_ORIGIN = "https://cloudcannon.com";
const MAX_REDIRECT_HOPS = 10;

const checker = new LinkChecker();

// Uncomment for verbose logs
// checker.on("pagestart", (url) => {
//   console.log((url as unknown as URL).pathname);
// });

// checker.on("link", (result) => {
//   if (result.state !== "SKIPPED") {
//     const url = result.url.replace(/^http:\/\/localhost:\d*/, "");
//     console.log(`  [${result.status}] ${url}`);
//   }
// });

const urlRewriteExpressions = routing.routes.filter(({ forced }) =>
  forced !== false
).map(({ from, to }) => ({
  pattern: new RegExp(`${from}?$`),
  replacement: to,
}));

const results = await checker.check({
  path: "documentation/",
  serverRoot: "_site",
  recurse: true,
  checkFragments: true,
  concurrency: 25,
  retryErrors: true,
  retryErrorsCount: 3,
  linksToSkip: [
    "^(?!http://(localhost|127\\.0\\.0\\.1):.*/documentation)",
    ".*_pagefind.*",
  ],
  urlRewriteExpressions,
});

console.log(results.passed ? "PASSED" : "FAILED");
const scannedLinks = results.links.filter((x) => x.state !== "SKIPPED");
console.log(`Scanned total of ${scannedLinks.length} links`);

const brokenLinks = scannedLinks.filter((x) => x.state === "BROKEN");
console.log(`Detected ${brokenLinks.length} broken links.`);

const brokenByUrl = Map.groupBy(brokenLinks, ({ url }) => url);
console.log(`Across ${brokenByUrl.size} unique URLs:`);

[...brokenByUrl]
  .sort(([, a], [, b]) => b.length - a.length)
  .forEach(([url, links]) => {
    const { status, failureDetails } = links[0];
    const reason = status ||
      failureDetails?.map((detail) => String(detail)).join("; ");
    console.log(`\n[${reason}] ${url} (${links.length})`);
    links.forEach(({ parent }) => console.log(`  from ${parent}`));
  });

const redirects = routing.routes.filter(({ forced, status }) =>
  forced !== false && status >= 300 && status < 400
).map(({ from, to }) => ({ pattern: new RegExp(`^${from}?$`), to }));

function redirectTarget(pathname: string): string | undefined {
  let current = pathname;
  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
    const redirect = redirects.find(({ pattern }) => pattern.test(current));
    if (!redirect) {
      break;
    }
    current = current.replace(redirect.pattern, redirect.to);
  }
  return current === pathname ? undefined : current;
}

const redirectedLinks = new Map<
  string,
  { target: string; pages: Set<string> }
>();
const parser = new DOMParser();

for await (
  const entry of walk(`${SITE_DIR}/documentation`, { exts: [".html"] })
) {
  const page = `/${relative(SITE_DIR, entry.path).replace(/index\.html$/, "")}`;
  const doc = parser.parseFromString(
    await Deno.readTextFile(entry.path),
    "text/html",
  );
  for (const anchor of doc.querySelectorAll("a[href]")) {
    const url = URL.parse(
      anchor.getAttribute("href")!,
      new URL(page, LIVE_ORIGIN),
    );
    if (
      url?.origin !== LIVE_ORIGIN || !url.pathname.startsWith("/documentation/")
    ) {
      continue;
    }
    const target = redirectTarget(url.pathname);
    if (target) {
      const link = redirectedLinks.get(url.pathname) ??
        { target, pages: new Set<string>() };
      link.pages.add(page);
      redirectedLinks.set(url.pathname, link);
    }
  }
}

const redirectedCount = [...redirectedLinks.values()].reduce(
  (total, { pages }) => total + pages.size,
  0,
);
console.log(
  `\nDetected ${redirectedCount} links that redirect. These work, but could point at the final URL.`,
);
console.log(`Across ${redirectedLinks.size} unique URLs:`);

[...redirectedLinks]
  .sort(([, a], [, b]) => b.pages.size - a.pages.size)
  .forEach(([url, { target, pages }]) => {
    console.log(`\n${url} -> ${target} (${pages.size})`);
    pages.forEach((page) => console.log(`  from ${page}`));
  });

if (!results.passed) {
  Deno.exit(1);
} else {
  Deno.exit(0);
}
