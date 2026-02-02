import type { DocEntry } from "../../../_types.d.ts";

interface PageData {
  url: string;
  layout: string;
  entry: DocEntry;
  title: string;
  description: string;
}

declare const DOCS: Record<string, DocEntry>;

function isRoutingEntry(entry: DocEntry): boolean {
  return entry.gid?.startsWith("routing.") || entry.gid === "type.Routing";
}

export default function* (): Generator<PageData> {
  for (const entry of Object.values(DOCS)) {
    if (isRoutingEntry(entry) && entry.url !== "/") {
      yield {
        url: `/developer-reference/routing-file${entry.url}`,
        layout: "layouts/automated-reference.tsx",
        entry,
        title: entry.title || entry.key || "",
        description: entry.description || `Documentation for ${entry.key}`,
      };
    }
  }
}
