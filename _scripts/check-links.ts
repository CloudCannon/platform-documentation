import { LinkChecker } from "npm:linkinator";
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
  linksToSkip: [
    "^(?!http://localhost:.*/documentation)",
    ".*_pagefind.*",
  ],
  urlRewriteExpressions,
});

console.log(results.passed ? "PASSED" : "FAILED");
const scannedLinks = results.links.filter((x) => x.state !== "SKIPPED");
console.log(`Scanned total of ${scannedLinks.length} links`);

const brokenLinks = scannedLinks.filter((x) => x.state === "BROKEN");
console.log(`Detected ${brokenLinks.length} broken links.`);

brokenLinks.forEach(({ parent, url }) => {
  console.log(`${parent} -> ${url}`);
});

if (!results.passed) {
  Deno.exit(1);
}
