import type { Page } from '../../_types.d.ts';

export const layout = "layouts/article.tsx";
export const date = "git last modified";

export function url(page: Page): string {
  let u = page.data.url;
  const parts = u.split("/").slice(1);
  u = `${parts[0]}-${parts[1]}/${parts[2]}`;
  return `/${u}/`;
}
