import type { DocEntry, Helpers } from "../_types.d.ts";
import { BASE_URL, type SectionId } from "./Reference/helpers.ts";
import RefItem from "./Reference/RefItem.tsx";

interface ReferenceDataRowProps {
  section: string;
  ref_key: string;
}

function findEntryByGid(
  section: string,
  ref_key: string,
): DocEntry | null {
  const sectionDocs: Record<string, DocEntry> = globalThis.DOCS?.[section] ??
    {};
  return sectionDocs[ref_key] ?? null;
}

function getDisplayKey(entry: DocEntry): string {
  const key = entry.full_key || entry.key || "";
  const parts = key.split(".").filter((p) => p !== "*");
  return parts.slice(-2).join(".").replace(/\([^)]*\)$/, "");
}

function formatDefault(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export default function ReferenceDataRow(
  { section, ref_key }: ReferenceDataRowProps,
  helpers: Helpers,
) {
  if (!ref_key?.trim()) return null;

  const entry = findEntryByGid(section, ref_key);

  if (!entry) {
    return (
      <div className="c-data-reference__item">
        <div className="c-data-reference__header c-anchor-header">
          <span className="c-data-reference__key">
            <strong>{ref_key}</strong>
          </span>
        </div>
        <div className="c-data-reference__description">
          <p>
            Definition not found: <code>{ref_key}</code> in{" "}
            <code>{section}</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="c-data-reference__item">
      <RefItem
        docRef={entry}
        section={section as SectionId}
        keyOverride={getDisplayKey(entry)}
        helpers={helpers}
      />
    </div>
  );
}

export function toMarkdown(
  { section, ref_key }: ReferenceDataRowProps,
): string {
  if (!ref_key?.trim()) return "";
  const entry = findEntryByGid(section, ref_key);
  if (!entry) return `**\`${ref_key}\`**\n\nDefinition not found.\n\n`;

  const label = entry.documentation?.title || entry.title || entry.full_key || entry.key || ref_key;
  const type = entry.type ? ` ${entry.type}` : "";
  const badges = [
    entry.required ? "Required" : "",
    entry.deprecated ? "Deprecated" : "",
  ].filter(Boolean).join(" ");
  const description = entry.documentation?.description || entry.description ||
    "";
  const deprecatedNote = entry.deprecated && entry.deprecated_description
    ? `\n\n${entry.deprecated_description.trim()}`
    : "";
  const defaultVal = entry.default !== undefined
    ? `\n\n**Default:** \`${formatDefault(entry.default)}\``
    : "";
  const refLink = entry.url
    ? `\n\n[Full reference](${BASE_URL}${entry.url})`
    : "";

  const badgeLine = badges ? ` — ${badges}` : "";
  return `**\`${label}\`**${type}${badgeLine}\n\n${description.trim()}${deprecatedNote}${defaultVal}${refLink}\n\n`;
}
