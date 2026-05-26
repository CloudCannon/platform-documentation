import { createHash } from "node:crypto";
import { fromFileUrl, join } from "@std/path";

const repoRoot = fromFileUrl(new URL("../../", import.meta.url));
const cacheDir = join(repoRoot, "_cache", "mermaid");
const puppeteerConfig = join(repoRoot, "_config", "puppeteer.json");
const lightConfigPath = join(repoRoot, "_config", "mermaid-light.json");

type Theme = "light" | "dark";

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

const renderOne = (chart: string, theme: Theme): string => {
  ensureCacheDir();
  const hash = hashChart(chart, theme);
  const svgPath = join(cacheDir, `${hash}.svg`);

  try {
    return stripXmlPreamble(Deno.readTextFileSync(svgPath));
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) throw err;
  }

  const source = initDirectiveFor(theme) + chart;
  const mmdPath = join(cacheDir, `${hash}.mmd`);
  Deno.writeTextFileSync(mmdPath, source);

  const result = new Deno.Command("mmdc", {
    args: [
      "-i", mmdPath,
      "-o", svgPath,
      "-b", "transparent",
      "-p", puppeteerConfig,
      "-I", `mermaid-${hash.slice(0, 10)}`,
      "--quiet",
    ],
    stdout: "piped",
    stderr: "piped",
  }).outputSync();

  try {
    Deno.removeSync(mmdPath);
  } catch { /* best effort */ }

  if (!result.success) {
    const stderr = new TextDecoder().decode(result.stderr);
    throw new Error(`mmdc failed (theme=${theme}):\n${stderr}\n--- chart ---\n${chart}`);
  }

  return stripXmlPreamble(Deno.readTextFileSync(svgPath));
};

export const renderMermaid = (chart: string): { light: string; dark: string } => {
  const trimmed = chart.trim();
  if (!trimmed) throw new Error("renderMermaid: empty chart source");
  return {
    light: renderOne(trimmed, "light"),
    dark: renderOne(trimmed, "dark"),
  };
};
