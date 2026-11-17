import { LinkChecker } from "linkinator";
import routing from "../.cloudcannon/routing.json" with { type: "json" };

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

if (!results.passed) {
  Deno.exit(1);
} else {
  Deno.exit(0);
}
