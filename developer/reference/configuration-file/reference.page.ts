import type { DocEntry } from "../../../_types.d.ts";

interface PageData {
  url: string;
  layout: string;
  entry: DocEntry;
  title: string;
  description: string;
}

declare const DOCS: Record<string, DocEntry>;

// Check if entry belongs to routing or ISS sections (to exclude them)
function isRoutingOrISS(entry: DocEntry): boolean {
  return (
    entry.gid?.startsWith("routing.") ||
    entry.gid === "type.Routing" ||
    entry.gid?.startsWith("iss.") ||
    entry.gid === "type.InitialSiteSettings"
  );
}

export default function* (): Generator<PageData> {
  for (const entry of Object.values(DOCS)) {
    // Only include configuration file entries (exclude routing and ISS)
    if (entry.gid && entry.url !== "/" && !isRoutingOrISS(entry)) {
      yield {
        url: `/developer-reference/configuration-file/${entry.url}/`,
        layout: "layouts/automated-reference.tsx",
        entry,
        title: entry.title || entry.key || "",
        description: entry.description || `Documentation for ${entry.key}`,
      };
    }
  }
}
