import { getDisplayName, getRefUrl } from "./helpers.ts";
import type { DocEntry } from "../../_types.d.ts";

interface RefNavItemProps {
  key?: string | number;
  entry?: DocEntry;
  currentUrl?: string;
  currentDoc?: unknown;
}

export default function RefNavItem({ entry, currentUrl }: RefNavItemProps) {
  if (!entry?.url) return null;

  const url = getRefUrl(entry);
  const name = getDisplayName(entry);
  const docUrl = currentUrl?.replace(
    "/documentation/developer-reference/configuration-file/",
    "",
  ) || "";
  const isActive = (entry.url + "/") === docUrl;
  return (
    <li>
      <a className="t-docs-nav__sub-list__article" href={url ?? undefined}>
        {name} {isActive ? " (active)" : undefined}
      </a>
    </li>
  );
}
