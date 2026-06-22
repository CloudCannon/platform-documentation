import {
  API_BASE_PATH,
  getApiResources,
} from "../../developer/reference/api/_shared/openapi.ts";
import type { Comp, Helpers } from "../../_types.d.ts";

interface ApiResourceIndexProps {
  comp: Comp;
  helpers?: Helpers;
}

// Lists every API resource group as a card, for the API landing page.
// Built from the OpenAPI spec, so it stays in sync as endpoints change.
export default function ApiResourceIndex(
  { comp, helpers }: ApiResourceIndexProps,
) {
  const resources = getApiResources();
  return (
    <div className="c-card-container--related">
      {resources.map((resource) => {
        const count = resource.operations.length;
        return (
          <comp.Card.Card
            key={resource.slug}
            href={`${API_BASE_PATH}${resource.slug}/`}
            title={resource.title}
            description={`${count} ${count === 1 ? "endpoint" : "endpoints"}`}
            helpers={helpers}
          />
        );
      })}
    </div>
  );
}
