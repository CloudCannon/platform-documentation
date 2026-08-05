import type { ApiResource as ApiResourceData } from "../../developer/reference/api/_shared/openapi.ts";
import type { Comp, Helpers } from "../../_types.d.ts";

interface ApiResourceProps {
  resource: ApiResourceData;
  helpers?: Helpers;
  comp: Comp;
}

export default function ApiResource(
  { resource, helpers, comp }: ApiResourceProps,
) {
  return (
    <div className="c-api-resource">
      {resource.description && (
        <p className="c-api-resource__description">{resource.description}</p>
      )}
      {resource.operations.map((operation) => (
        <comp.Api.ApiOperation
          key={operation.id}
          operation={operation}
          helpers={helpers}
        />
      ))}
    </div>
  );
}
