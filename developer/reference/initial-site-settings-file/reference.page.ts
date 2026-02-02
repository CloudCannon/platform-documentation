import type { DocEntry } from "../../../_types.d.ts";

interface PageData {
  url: string;
  layout: string;
  entry: DocEntry;
  title: string;
  description: string;
}

declare const DOCS: Record<string, DocEntry>;

function isISSEntry(entry: DocEntry): boolean {
  return entry.gid?.startsWith("iss.") ||
    entry.gid === "type.InitialSiteSettings";
}

export default function* (): Generator<PageData> {
  for (const entry of Object.values(DOCS)) {
    if (isISSEntry(entry) && entry.url !== "/") {
      yield {
        url: `/developer-reference/initial-site-settings-file${entry.url}`,
        layout: "layouts/automated-reference.tsx",
        entry,
        title: entry.title || entry.key || "",
        description: entry.description || `Documentation for ${entry.key}`,
      };
    }
  }
}
