import { getDisplayName } from "./helpers.ts";
import type { DocEntry } from "../../_types.d.ts";

interface RefNavItemProps {
  key?: string | number;
  entry?: DocEntry;
  currentUrl?: string;
  currentDoc?: unknown;
  sectionPath?: string;
}

export default function RefNavItem({
  entry,
  currentUrl,
  sectionPath = "/documentation/developer-reference/configuration-file/",
}: RefNavItemProps) {
  // Skip entries without URL or with root URL (root type is shown on home page)
  if (!entry?.url || entry.url === "/") return null;

  // Build URL using sectionPath instead of hardcoded BASE_URL
  const url = `${sectionPath.replace(/\/$/, "")}${entry.url}`;
  const name = getDisplayName(entry);
  
  // Compare full URLs instead of partial paths to avoid leading slash issues
  const normalizedCurrentUrl = currentUrl?.replace(/\/$/, "") || "";
  const normalizedEntryUrl = url.replace(/\/$/, "");
  const isActive = normalizedCurrentUrl === normalizedEntryUrl;


  return (
    <li>
      <a
        className="t-docs-nav__sub-list__article"
        href={url}
        aria-current={isActive ? "page" : undefined}
      >
        {name}
      </a>
    </li>
  );
}
