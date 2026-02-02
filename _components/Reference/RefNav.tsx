/**
 * RefNav - Reference navigation sidebar
 *
 * Replaces referencenav.njk
 * Renders the list of top-level navigation items for the configuration reference
 */

import RefNavItem from "./RefNavItem.tsx";
import type { DocEntry } from "../../_types.d.ts";

interface RefNavProps {
  currentDoc?: unknown;
  currentUrl: string;
  items?: DocEntry[];
}

/**
 * Reference navigation list
 */
export default function RefNav({ currentDoc, currentUrl, items }: RefNavProps) {
  // Filter to only show items that should appear in navigation
  const navItems = (items || []).filter((item) =>
    item.documentation?.show_in_navigation
  );

  return (
    <ol className="t-docs-nav__sub-list">
      {navItems.map((item) => (
        <RefNavItem
          key={item.gid}
          entry={item}
          currentDoc={currentDoc}
          currentUrl={currentUrl}
        />
      ))}
    </ol>
  );
}
