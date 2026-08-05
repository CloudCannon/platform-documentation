import {
  type ApiResource,
  getApiResources,
} from "./_shared/openapi.ts";

interface ApiPageData {
  url: string;
  layout: string;
  resource: ApiResource;
  title: string;
  description: string;
}

// Generates one page per API resource (OpenAPI tag) from the vendored spec.
export default function* (): Generator<ApiPageData> {
  for (const resource of getApiResources()) {
    yield {
      url: `/developer-reference/api/${resource.slug}/`,
      layout: "layouts/api-reference.tsx",
      resource,
      title: resource.title,
      description: resource.description ||
        `${resource.title} endpoints in the CloudCannon API.`,
    };
  }
}
