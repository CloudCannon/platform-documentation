import type { DocEntry } from "../../../_types.d.ts";

// Section ID type for reference navigation
export type SectionId =
  | "type.Configuration"
  | "type.Routing"
  | "type.InitialSiteSettings";

// Precompiled reference navigation item
export interface RefNavItem {
  url: string;
  name: string;
  gid: string;
}

// Precompiled reference navigation section
export interface RefNavSection {
  id: SectionId;
  heading: string;
  icon: string;
  basePath: string;
  items: RefNavItem[];
}

// Helper to get display name for nav items
function getNavDisplayName(entry: DocEntry): string {
  if (!entry) return "unknown";
  if (entry.title) return entry.title;
  if (entry.key) {
    const parts = entry.key.split(".");
    return parts[parts.length - 1];
  }
  return "unknown";
}

// Build precompiled reference navigation items for a section
function buildRefNavItems(
  docs: DocEntry[],
  sectionId: SectionId,
): RefNavItem[] {
  return docs
    .filter((d) =>
      d.documentation?.show_in_navigation &&
      d.url &&
      d.url !== "/" &&
      d.gid !== sectionId
    )
    .map((d) => ({
      url: `/documentation/developer-reference${d.url}`, // d.url already includes section path
      name: getNavDisplayName(d),
      gid: d.gid || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build precompiled reference navigation sections from documentation entries.
 */
export function buildRefNav(
  configDocs: DocEntry[],
  routingDocs: DocEntry[],
  initialSiteSettingsDocs: DocEntry[],
): RefNavSection[] {
  return [
    {
      id: "type.Configuration",
      heading: "Configuration File",
      icon: "settings",
      basePath: "/documentation/developer-reference/configuration-file/",
      items: buildRefNavItems(configDocs, "type.Configuration"),
    },
    {
      id: "type.Routing",
      heading: "Routing File",
      icon: "route",
      basePath: "/documentation/developer-reference/routing-file/",
      items: buildRefNavItems(routingDocs, "type.Routing"),
    },
    {
      id: "type.InitialSiteSettings",
      heading: "Initial Site Settings File",
      icon: "tune",
      basePath: "/documentation/developer-reference/initial-site-settings-file/",
      items: buildRefNavItems(initialSiteSettingsDocs, "type.InitialSiteSettings"),
    },
  ];
}
