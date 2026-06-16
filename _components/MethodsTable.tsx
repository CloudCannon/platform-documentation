import { type SectionId } from "./Reference/helpers.ts";
import RefItem from "./Reference/RefItem.tsx";
import type { DocEntry, Helpers } from "../_types.d.ts";

interface MethodsTableProps {
  section: SectionId;
}

// Renders every method of a section (the section root's properties) as reference
// rows, alphabetically by key to match the object pages (ReferenceContent sorts
// the same way). Auto-syncs: a new method in the source appears here with no
// manual edit. Return types linkify to their object pages.
export default function MethodsTable(
  { section }: MethodsTableProps,
  helpers: Helpers,
) {
  const sectionDocs = globalThis.DOCS?.[section] ?? {};
  const root = sectionDocs[section];
  const gids = Object.values(root?.properties ?? {})
    .map((ref) => ref.gid)
    .filter((gid): gid is string => !!gid)
    .sort((a, b) =>
      (sectionDocs[a]?.key ?? a).replace(/^_+/, "")
        .localeCompare((sectionDocs[b]?.key ?? b).replace(/^_+/, ""))
    );

  if (gids.length === 0) return null;

  return (
    <div class="c-data-reference">
      {gids.map((gid) => {
        const entry = sectionDocs[gid];
        if (!entry) return null;
        return (
          <div class="c-data-reference__item" key={gid}>
            <RefItem docRef={entry} section={section} helpers={helpers} />
          </div>
        );
      })}
    </div>
  );
}

// Markdown rendering for the markdown / llms.txt export. Mirrors the HTML above:
// one entry per method, alphabetically by key, with its return type, description,
// and examples — read from the same globalThis.DOCS data the component renders from.
export function toMarkdown(props: Record<string, unknown>): string {
  const section = props.section as SectionId | undefined;
  if (!section) return "";
  const sectionDocs = globalThis.DOCS?.[section] ?? {};
  const root = sectionDocs[section];
  const methods = Object.values(root?.properties ?? {})
    .map((ref) => (ref?.gid ? sectionDocs[ref.gid] : undefined))
    .filter((entry): entry is DocEntry => !!entry)
    .sort((a, b) =>
      (a.key ?? "").replace(/^_+/, "").localeCompare(
        (b.key ?? "").replace(/^_+/, ""),
      )
    );
  if (methods.length === 0) return "";

  const lines: string[] = [];
  for (const m of methods) {
    lines.push(`### \`${m.key || m.title || "method"}\``, "");
    if (m.type) lines.push(`**Type:** \`${m.type}\``, "");
    if (m.description) lines.push(m.description, "");
    const examples = (m.documentation?.examples || []).filter((ex) => ex.code);
    for (const ex of examples) {
      if (ex.description) lines.push(ex.description, "");
      lines.push("```" + (ex.language || "javascript"), ex.code as string, "```", "");
    }
  }
  return lines.join("\n");
}
