import { DocEntry } from "./types.d.ts";

// Section type identifiers
export type SectionId =
  | "type.Configuration"
  | "type.Routing"
  | "type.InitialSiteSettings";

// Base URL for all reference pages (entry.url already includes section path)
const DEVELOPER_REFERENCE_BASE = "/documentation/developer-reference";

export const BASE_URL = DEVELOPER_REFERENCE_BASE;

// Get docs for a specific section
function getSectionDocs(section: SectionId): Record<string, DocEntry> {
  return globalThis.DOCS?.[section] ?? {};
}

// Get just the last segment of a dotted key (e.g., "headers.match" -> "match")
export function getShortKey(key: string | undefined): string {
  if (!key) return "unknown";
  const parts = key.split(".");
  const lastPart = parts[parts.length - 1];
  return lastPart.endsWith("[*]") ? "[*]" : lastPart;
}

// "Type reset" entries (parent === 'type.Configuration' && show_in_navigation) display title instead of key
export function getDisplayName(entry: DocEntry | null | undefined): string {
  if (!entry) return "unknown";

  // TODO if it is a key, we want it presented in monospace font
  return entry.title || getShortKey(entry.key) || "unknown";
}

export function getDisplayNamePair(
  entry: DocEntry | null | undefined,
): { label: string; useCode: boolean } {
  if (entry?.title) return { label: entry.title, useCode: false };
  if (entry?.key) return { label: getShortKey(entry.key), useCode: true };
  return { label: "unknown", useCode: false };
}

export function getRefUrl(
  entry: DocEntry | null | undefined,
  _section: SectionId,
): string | null {
  if (!entry?.url) return null;
  // entry.url already includes section path (e.g., /configuration-file/types/_editables/)
  return `${DEVELOPER_REFERENCE_BASE}${entry.url}`;
}

// Resolves a reference, merging any documentation overrides
export function resolveRef(
  docRef: DocEntry | null | undefined,
  section: SectionId,
): DocEntry | null {
  if (!docRef) return null;

  const sectionDocs = getSectionDocs(section);
  const doc = (docRef.gid && sectionDocs[docRef.gid]) || docRef;

  if (docRef.documentation) {
    return {
      ...doc,
      title: docRef.documentation.title || doc.title,
      description: docRef.documentation.description || doc.description,
      examples: docRef.documentation.examples?.length
        ? docRef.documentation.examples
        : doc.examples,
      documentation: docRef.documentation,
    };
  }

  return doc;
}

export function getDocByGid(
  gid: string | null | undefined,
  section: SectionId,
): DocEntry | null {
  if (!gid) return null;
  const sectionDocs = getSectionDocs(section);
  return sectionDocs[gid] || null;
}

// Check if gid is a descendant of parentGid (for nav active state)
export function isGidInside(
  gid: string | undefined,
  parentGid: string,
): boolean {
  if (!gid) return false;
  if (parentGid === "type.Configuration") return !gid.startsWith("type.");
  return gid.startsWith(`${parentGid}.`);
}

// Build breadcrumb chain from entry up to type-reset ancestor
export function getBreadcrumbChain(
  startDoc: DocEntry | null | undefined,
  section: SectionId,
): DocEntry[] {
  if (!startDoc) return [];

  const sectionDocs = getSectionDocs(section);
  const chain = [startDoc];
  let current: DocEntry | null | undefined = startDoc;

  while (current && current.parent !== section) {
    const parentDoc: DocEntry | null | undefined = current.parent
      ? sectionDocs[current.parent]
      : null;
    if (parentDoc) {
      chain.unshift(parentDoc);
      current = parentDoc;
    } else {
      break;
    }
  }

  return chain;
}

export function getParentGids(
  doc: DocEntry | null | undefined,
  section: SectionId,
): string[] {
  if (!doc) return [];

  const sectionDocs = getSectionDocs(section);
  const parentGids: string[] = [];
  let parentGid = doc.parent;

  while (parentGid) {
    parentGids.unshift(parentGid);
    const parentDoc = sectionDocs[parentGid];
    parentGid = parentDoc?.parent;
  }

  return parentGids;
}

export function isTypeReset(
  entry: DocEntry | null | undefined,
  section: SectionId,
): boolean {
  return entry?.parent === section &&
    entry?.documentation?.show_in_navigation === true;
}
