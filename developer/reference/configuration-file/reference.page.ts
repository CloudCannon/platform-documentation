import type { DocEntry } from "../../../_types.d.ts";

interface PageData {
  url: string;
  layout: string;
  entry: DocEntry;
  title: string;
  description: string;
}

declare const DOCS: Record<string, DocEntry>;

export default function* (): Generator<PageData> {
  for (const entry of Object.values(DOCS)) {
    if (entry.gid && entry.url != "/") {
      yield {
        url: `/developer-reference/configuration-file/${entry.url}/`,
        layout: "layouts/automated-reference.tsx",
        entry,
        // Page title for base layout
        title: entry.title || entry.key || "",
        description: entry.description || `Documentation for ${entry.key}`,
      };
    }
  }
}
