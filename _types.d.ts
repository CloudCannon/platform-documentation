// ============================================================================
// LUME TYPE EXTENSIONS
// ============================================================================

// Extend Lume's global namespace with our custom helpers and data types
// See: https://lume.land/docs/configuration/using-typescript/
declare global {
  // Global DOCS from @cloudcannon/configuration-types package
  // Populated in _config.ts via: globalThis.DOCS = documentation
  // Nested structure: section (e.g., "type.Configuration") -> gid -> DocEntry
  var DOCS: Record<string, Record<string, import("./_types.d.ts").DocEntry>>;

  namespace Lume {
    // Extend Lume.Helpers with our project-specific helper functions
    // Note: md, url, and date are already defined by Lume - we're adding custom helpers
    interface Helpers {
      // Markdown helper (provided by Lume)
      md: (content: string, inline?: boolean) => string;

      // Icon helpers (custom)
      icon: (name: string, source: string) => string;

      // String helpers (custom)
      unslug: (s: string) => string;

      // Rendering helpers (custom)
      render_text_only?: (content: unknown) => Promise<string>;
      render_page_content: (page: unknown) => Promise<string>;
      render_common: (
        file: string,
        data: { comp: string; parameters: unknown },
      ) => string;

      // Navigation helpers (custom)
      get_index_page: (url?: string) => IndexPage | null;
      bubble_up_nav: (headings?: ContentNavBlock[]) => ContentNavBlock[];

      // Content helpers (custom)
      get_glossary_term: (term: string) => string;
      get_glossary_term_name: (term: string) => string;
    }
  }
}

// Re-export Lume.Helpers as Helpers for convenience
export type Helpers = Lume.Helpers;

// ============================================================================
// COMMON PAGE & DOCUMENT TYPES
// ============================================================================

// Base Details interface used across layouts
export interface Details {
  title?: string;
  description?: string;
  category?: string;
  order?: number;
  related_articles?: Array<{
    item: string;
  }>;
}

interface PageData extends Lume.Data {
  title?: string;
  details?: Details;
  _uuid?: string;
  [key: string]: unknown;
}

// Page interface for Lume pages
export type Page = Lume.Page<PageData>;

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

// Content navigation (articles, guides, etc.)
export interface ContentNavItem {
  _type?: string;
  name?: string;
  _bubbled?: string[];
  items?: ContentNavItem[];
  articles?: string[];
}

export interface ContentNavBlock {
  _uuid?: string;
  heading?: string;
  heading_hidden?: boolean;
  icon?: string;
  _bubbled?: string[];
  configuration_types_documentation?: boolean;
  data_source?: string;
  items?: ContentNavItem[];
}

export interface ContentNavigation {
  title: string;
  headings?: ContentNavBlock[];
  [key: string]: unknown;
}

// Header navigation (top nav bar)
export interface HeaderNavSubItem {
  href: string;
  icon?: string;
  heading: string;
  description: string;
}

export interface HeaderNavItem {
  href?: string;
  text?: string;
  items?: HeaderNavSubItem[];
}

export interface HeaderNavigation {
  banner_html?: string;
  items?: HeaderNavItem[];
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

// Generic search interface - specific implementations may extend this
export interface BaseSearch {
  page?: (query: string) => unknown;
  pages?: (query: string, sort?: string) => unknown[];
  [key: string]: unknown;
}

// Search interface for page lookups (used by navigation and related articles)
export interface PageSearch {
  page: (query: string) => ArticlePage | null;
  pages?: (query: string, sort?: string) => ArticlePage[];
}

// ============================================================================
// REFERENCE NAVIGATION TYPES
// ============================================================================

// Navigation item for reference docs (used by RefNav and DocNav)
export interface RefNavItem {
  gid: string;
  url?: string;
  documentation?: {
    show_in_navigation?: boolean;
  };
}

// ============================================================================
// REFERENCE DOCUMENTATION TYPES
// ============================================================================

export interface CodeExample {
  code?: string;
  description?: string;
  language?: string;
  source?: string;
  annotations?: Array<{
    number?: number;
    content?: string;
  }>;
}

export interface DocEntry {
  gid?: string;
  title?: string;
  key?: string;
  full_key?: string;
  url?: string;
  type?: string;
  description?: string;
  required?: boolean;
  parent?: string;
  appears_in?: string[];
  anyOf?: DocEntry[];
  items?: DocEntry[];
  properties?: Record<string, DocEntry>;
  additionalProperties?: DocEntry[];
  uniqueItems?: boolean;
  const?: string;
  default?: unknown;
  enum?: string[];
  examples?: CodeExample[];
  documentation?: {
    title?: string;
    description?: string;
    show_in_navigation?: boolean;
    examples?: CodeExample[];
  };
}

// ============================================================================
// ARTICLE & CONTENT TYPES
// ============================================================================

export interface ArticlePage {
  url: string;
  title?: string;
  content?: string;
  details?: Details;
  page?: Page;
  data?: {
    details?: Details;
    [key: string]: unknown;
  };
  attrs?: {
    _uuid?: string;
    details?: Details;
  };
}

// ============================================================================
// INDEX PAGE TYPES
// ============================================================================

export interface IndexPage {
  url: string;
  title?: string;
  attrs?: {
    _uuid?: string;
    details?: Details;
  };
}

// ============================================================================
// CHANGELOG TYPES
// ============================================================================

export interface ChangelogYears {
  keys?: string[];
  [year: string]: string[] | number | unknown;
}

// ============================================================================
// GLOSSARY TYPES
// ============================================================================

export interface GlossaryEntry {
  _schema?: string;
  glossary_term_name: string;
  term_description: string;
  documentation_link?: string;
}
