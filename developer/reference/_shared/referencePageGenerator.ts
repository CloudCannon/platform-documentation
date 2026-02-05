import type { DocEntry } from "../../../_types.d.ts";
import type { SectionId } from "../../../_components/Reference/helpers.ts";

export interface PageData {
  url: string;
  layout: string;
  entry: DocEntry;
  section: SectionId;
  title: string;
  description: string;
}

declare const DOCS: Record<string, Record<string, DocEntry>>;

/**
 * Creates a page generator for a reference section.
 * @param section - The section ID (e.g., "type.Configuration")
 */
export function createReferencePageGenerator(
  section: SectionId,
): () => Generator<PageData> {
  return function* (): Generator<PageData> {
    const sectionDocs = DOCS[section] ?? {};
    for (const entry of Object.values(sectionDocs)) {
      // Skip root entries (gid === section) - these are handled by index.mdx pages
      if (
        entry.gid && entry.gid !== section && entry.url && entry.url !== "/"
      ) {
        yield {
          url: `/developer-reference${entry.url}`, // entry.url already includes section path
          layout: "layouts/automated-reference.tsx",
          entry,
          section,
          title: entry.title || entry.key || "",
          description: entry.description || `Documentation for ${entry.key}`,
        };
      }
    }
  };
}
