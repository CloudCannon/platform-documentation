import { DOMParser } from "@b-fuze/deno-dom";
import { join } from "@std/path";

const SITE_DIR = "_site";
const SCAN_DIR = `${SITE_DIR}/documentation`;
const CONCURRENCY = 20;

interface BrokenImage {
  page: string;
  src: string;
}

async function* walkHtml(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = join(dir, entry.name);
    if (entry.isDirectory) {
      yield* walkHtml(path);
    } else if (entry.name.endsWith(".html")) {
      yield path;
    }
  }
}

async function collectImages(): Promise<Map<string, Set<string>>> {
  const imageMap = new Map<string, Set<string>>();
  const parser = new DOMParser();

  for await (const path of walkHtml(SCAN_DIR)) {
    const html = await Deno.readTextFile(path);
    const doc = parser.parseFromString(html, "text/html");
    if (!doc) continue;

    const imgs = doc.querySelectorAll("img[src]");
    for (const img of imgs) {
      const src = img.getAttribute("src");
      if (!src) continue;

      const pages = imageMap.get(src) ?? new Set<string>();
      pages.add(path);
      imageMap.set(src, pages);
    }
  }

  return imageMap;
}

async function checkLocalImage(src: string): Promise<boolean> {
  const fsPath = `${SITE_DIR}${src}`;
  try {
    await Deno.stat(fsPath);
    return true;
  } catch {
    return false;
  }
}

async function checkRemoteImage(url: string): Promise<boolean> {
  try {
    const resp = await fetch(url, { method: "HEAD" });
    return resp.ok;
  } catch {
    return false;
  }
}

async function batchCheck<T>(
  items: T[],
  checker: (item: T) => Promise<boolean>,
  concurrency: number,
): Promise<Map<T, boolean>> {
  const results = new Map<T, boolean>();
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const checks = await Promise.all(batch.map(checker));
    batch.forEach((item, idx) => results.set(item, checks[idx]));
  }
  return results;
}

function isDocShot(src: string): boolean {
  return src.includes("cc-screenshots.imgix.net");
}

function isExternalImage(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

async function main() {
  console.log("Scanning HTML files for images...");
  const imageMap = await collectImages();
  console.log(`Found ${imageMap.size} unique image sources.`);

  const localSrcs: string[] = [];
  const docShotSrcs: string[] = [];
  const externalSrcs: string[] = [];

  for (const src of imageMap.keys()) {
    if (isDocShot(src)) {
      docShotSrcs.push(src);
    } else if (isExternalImage(src)) {
      externalSrcs.push(src);
    } else {
      localSrcs.push(src);
    }
  }

  console.log(
    `Checking ${localSrcs.length} local, ${docShotSrcs.length} DocShot, ${externalSrcs.length} other external images...`,
  );

  const localResults = await batchCheck(
    localSrcs,
    checkLocalImage,
    CONCURRENCY,
  );
  const docShotResults = await batchCheck(
    docShotSrcs,
    checkRemoteImage,
    CONCURRENCY,
  );
  const externalResults = await batchCheck(
    externalSrcs,
    checkRemoteImage,
    CONCURRENCY,
  );

  const brokenLocal: BrokenImage[] = [];
  const brokenDocShots: BrokenImage[] = [];
  const brokenExternal: BrokenImage[] = [];

  for (const [src, ok] of localResults) {
    if (!ok) {
      for (const page of imageMap.get(src)!) {
        brokenLocal.push({ page, src });
      }
    }
  }

  for (const [src, ok] of docShotResults) {
    if (!ok) {
      for (const page of imageMap.get(src)!) {
        brokenDocShots.push({ page, src });
      }
    }
  }

  for (const [src, ok] of externalResults) {
    if (!ok) {
      for (const page of imageMap.get(src)!) {
        brokenExternal.push({ page, src });
      }
    }
  }

  const totalBroken =
    brokenLocal.length + brokenDocShots.length + brokenExternal.length;

  if (brokenLocal.length > 0) {
    console.log(`\n--- Broken Local Images (${brokenLocal.length}) ---`);
    brokenLocal.forEach(({ page, src }) => console.log(`${page} -> ${src}`));
  }

  if (brokenDocShots.length > 0) {
    console.log(`\n--- Broken DocShots (${brokenDocShots.length}) ---`);
    brokenDocShots.forEach(({ page, src }) =>
      console.log(`${page} -> ${src}`)
    );
  }

  if (brokenExternal.length > 0) {
    console.log(
      `\n--- Broken External Images (${brokenExternal.length}) ---`,
    );
    brokenExternal.forEach(({ page, src }) =>
      console.log(`${page} -> ${src}`)
    );
  }

  console.log(
    `\n${totalBroken === 0 ? "PASSED" : "FAILED"} — ${totalBroken} broken image(s) found.`,
  );
  Deno.exit(totalBroken === 0 ? 0 : 1);
}

main();
