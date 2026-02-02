import type { Page } from "../../_types.d.ts";

export default {
  url: (page: Page): string => {
    const u = page.data.url;
    const parts = u.split("/").slice(3);
    return `/user-guides/${parts.join("/")}`;
  },
  layout: "layouts/guide.tsx",
};
