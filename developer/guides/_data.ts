import type { Page } from '../../_types.d.ts';

export const url = (page: Page): string => {
  const u = page.data.url;
  const parts = u.split("/").slice(3);
  return `/developer-guides/${parts.join("/")}`;
};

export const layout = "layouts/guide.tsx";
