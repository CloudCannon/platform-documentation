import {
  API_BASE_PATH,
  getApiResources,
} from "../../developer/reference/api/_shared/openapi.ts";

// Lists every API resource group as a link, for the API landing page.
// Built from the OpenAPI spec, so it stays in sync as endpoints change.
export default function ApiResourceIndex() {
  const resources = getApiResources();
  return (
    <ul className="c-api-index">
      {resources.map((resource) => {
        const count = resource.operations.length;
        return (
          <li className="c-api-index__item" key={resource.slug}>
            <a href={`${API_BASE_PATH}${resource.slug}/`}>{resource.title}</a>
            <span className="c-api-index__count">
              {count} {count === 1 ? "endpoint" : "endpoints"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
