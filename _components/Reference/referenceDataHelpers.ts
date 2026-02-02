import type { CodeExample, DocEntry } from "../../_types.d.ts";

/**
 * Shared interfaces and helpers for data-driven reference sections.
 * Used by page generators and _config.ts to avoid code duplication.
 */

// Interface for keys defined in YAML reference data files
export interface ReferenceKey {
  key: string;
  type: string;
  description: string;
  parent?: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
  show_in_navigation?: boolean;
  children?: string[];
  examples?: CodeExample[];
}

// Interface for the structure of YAML reference data files
export interface ReferenceData {
  title: string;
  source_file: string;
  description: string;
  intro: string;
  keys: ReferenceKey[];
}

// Interface for generated page data
export interface ReferencePageData {
  url: string;
  layout: string;
  entry: DocEntry;
  title: string;
  description: string;
}

/**
 * Convert a ReferenceKey from YAML format to DocEntry format.
 * Used for both page generation and navigation data.
 */
export function keyToDocEntry(
  key: ReferenceKey,
  sectionSlug: string,
): DocEntry {
  return {
    gid: `${sectionSlug}.${key.key}`,
    key: key.key,
    full_key: key.key,
    url: `/${key.key.replace(/\./g, "/")}/`,
    type: key.type?.toLowerCase() || "string",
    description: key.description,
    required: key.required,
    default: key.default,
    enum: key.enum,
    parent: key.parent ? `${sectionSlug}.${key.parent}` : undefined,
    documentation: {
      show_in_navigation: key.show_in_navigation ?? true,
      examples: key.examples,
    },
  };
}

// Configuration for creating a reference page generator
export interface ReferenceGeneratorConfig {
  dataPath: string; // Key in data.reference (e.g., "routing" or "initial-site-settings")
  sectionSlug: string; // Used for gid prefix (e.g., "routing-file")
  urlPrefix: string; // URL path prefix (e.g., "/developer-reference/routing-file/")
}

/**
 * Factory function to create a page generator for a reference section.
 * Reduces duplication between routing-file and initial-site-settings-file generators.
 */
export function createReferencePageGenerator(config: ReferenceGeneratorConfig) {
  return function* (
    data: { reference?: Record<string, ReferenceData | undefined> },
  ): Generator<ReferencePageData> {
    const referenceData = data.reference?.[config.dataPath];

    if (!referenceData?.keys) {
      console.warn(`No ${config.dataPath} reference data found`);
      return;
    }

    for (const key of referenceData.keys) {
      if (key.show_in_navigation !== false) {
        const entry = keyToDocEntry(key, config.sectionSlug);

        yield {
          url: `${config.urlPrefix}${key.key.replace(/\./g, "/")}/`,
          layout: "layouts/automated-reference.tsx",
          entry,
          title: key.key,
          description: key.description || `Documentation for ${key.key}`,
        };
      }
    }
  };
}

/**
 * Load reference keys from a ReferenceData object and convert to DocEntry array.
 * Used in _config.ts to prepare navigation data.
 */
export function loadReferenceKeys(
  referenceData: ReferenceData | undefined,
  sectionSlug: string,
): DocEntry[] {
  if (!referenceData?.keys) {
    return [];
  }

  return referenceData.keys.map((key) => keyToDocEntry(key, sectionSlug));
}
