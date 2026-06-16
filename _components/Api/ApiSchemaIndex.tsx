import {
  API_SCHEMAS_BASE_PATH,
  getApiSchemas,
} from "../../developer/reference/api/_shared/openapi.ts";
import type { Comp, Helpers } from "../../_types.d.ts";

interface ApiSchemaIndexProps {
  comp: Comp;
  helpers?: Helpers;
}

// Lists every named schema as a card, for the API schemas index page.
// Built from the OpenAPI spec, so it stays in sync as schemas change.
export default function ApiSchemaIndex(
  { comp, helpers }: ApiSchemaIndexProps,
) {
  const schemas = getApiSchemas();
  return (
    <div className="c-card-container--related">
      {schemas.map((schema) => {
        const count = schema.rows.length;
        return (
          <comp.Card.Card
            key={schema.slug}
            href={`${API_SCHEMAS_BASE_PATH}${schema.slug}/`}
            title={schema.name}
            description={`${count} ${count === 1 ? "property" : "properties"}`}
            helpers={helpers}
          />
        );
      })}
    </div>
  );
}
