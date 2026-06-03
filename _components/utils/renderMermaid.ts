import { createHash } from "node:crypto";
import { fromFileUrl, join } from "@std/path";

const repoRoot = fromFileUrl(new URL("../../", import.meta.url));
const cacheDir = join(repoRoot, "_cache", "mermaid");
const puppeteerConfig = join(repoRoot, "_config", "puppeteer.json");
const lightConfigPath = join(repoRoot, "_config", "mermaid-light.json");

type Theme = "light" | "dark";

const HASH_MARKER = "mermaid-hash:";
const hashCommentPattern = /^\s*<!--\s*mermaid-hash:\s*([0-9a-f]+)\s*-->\s*/i;

const initDirectiveFor = (theme: Theme): string => {
  if (theme === "light") {
    const config = Deno.readTextFileSync(lightConfigPath);
    return `%%{init: ${config.trim()}}%%\n`;
  }
  return `%%{init: {"theme": "dark", "flowchart": {"curve": "linear", "padding": 2, "nodeSpacing": 25, "rankSpacing": 25}}}%%\n`;
};

const hashChart = (chart: string, theme: Theme): string =>
  createHash("sha1")
    .update(`${theme}\n${initDirectiveFor(theme)}${chart}`)
    .digest("hex");

const ensureCacheDir = (() => {
  let ready = false;
  return () => {
    if (ready) return;
    Deno.mkdirSync(cacheDir, { recursive: true });
    ready = true;
  };
})();

const stripXmlPreamble = (svg: string): string =>
  svg.replace(/^\s*<\?xml[^?]*\?>\s*/i, "")
    .replace(/^\s*<!DOCTYPE[^>]*>\s*/i, "");

const extractHashComment = (svg: string): { hash: string | null; body: string } => {
  const match = svg.match(hashCommentPattern);
  if (!match) return { hash: null, body: svg };
  return { hash: match[1], body: svg.slice(match[0].length) };
};

const renderOne = (name: string, chart: string, theme: Theme): string => {
  ensureCacheDir();
  const expectedHash = hashChart(chart, theme);
  const svgPath = join(cacheDir, `${name}-${theme}.svg`);

  let existing: string | null = null;
  try {
    existing = Deno.readTextFileSync(svgPath);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }

  if (existing !== null) {
    const { hash, body } = extractHashComment(existing);
    if (hash === expectedHash) {
      return stripXmlPreamble(body);
    }
    if (hash === null) {
      throw new Error(
        `Mermaid SVG ${svgPath} is missing its ${HASH_MARKER} comment.\n` +
        `Delete the file and rebuild locally to regenerate it with the current chart.\n` +
        `--- chart (theme=${theme}) ---\n${chart}`,
      );
    }
    // Hash present but stale → try to regenerate below. If mmdc isn't
    // available we fall through to the "missing/unrenderable" error.
  }

  const source = initDirectiveFor(theme) + chart;
  const mmdPath = join(cacheDir, `${name}-${theme}.mmd`);
  Deno.writeTextFileSync(mmdPath, source);

  let result;
  try {
    result = new Deno.Command("mmdc", {
      args: [
        "-i", mmdPath,
        "-o", svgPath,
        "-b", "transparent",
        "-p", puppeteerConfig,
        "-I", `mermaid-${name}-${theme}`,
        "--quiet",
      ],
      stdout: "piped",
      stderr: "piped",
    }).outputSync();
  } catch (err) {
    try {
      Deno.removeSync(mmdPath);
    } catch { /* best effort */ }
    if (err instanceof Deno.errors.NotFound) {
      const stale = existing !== null;
      throw new Error(
        stale
          ? `Mermaid SVG ${svgPath} is stale (chart edited since last render) and mmdc is not installed in this environment.\n`
          : `Mermaid SVG ${svgPath} is missing and mmdc is not installed in this environment.\n`,
      );
    }
    throw err;
  }

  try {
    Deno.removeSync(mmdPath);
  } catch { /* best effort */ }

  if (!result.success) {
    const stderr = new TextDecoder().decode(result.stderr);
    throw new Error(`mmdc failed (name=${name}, theme=${theme}):\n${stderr}\n--- chart ---\n${chart}`);
  }

  // Prepend the hash comment to the freshly rendered SVG so later builds
  // can detect a stale file when the chart source changes.
  const rendered = Deno.readTextFileSync(svgPath);
  const withHash = `<!-- ${HASH_MARKER} ${expectedHash} -->\n${rendered}`;
  Deno.writeTextFileSync(svgPath, withHash);

  return stripXmlPreamble(rendered);
};

export const renderMermaid = (
  name: string,
  chart: string,
): { light: string; dark: string } => {
  const trimmed = chart.trim();
  if (!trimmed) throw new Error(`renderMermaid: empty chart source (name=${name})`);
  return {
    light: renderOne(name, trimmed, "light"),
    dark: renderOne(name, trimmed, "dark"),
  };
};
