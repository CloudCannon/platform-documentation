import type { Page } from "../../_types.d.ts";

export const layout = "layouts/reference-home.tsx";
export const date = "git last modified";

export function url(page: Page): string {
  const u = page.data.url;
  const parts = u.split("/").slice(3);
  return `/developer-reference/${parts.join("/")}`;
}
