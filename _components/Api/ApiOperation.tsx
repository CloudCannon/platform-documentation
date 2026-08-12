import type {
  OperationView,
  ParameterView,
  SchemaTypeRef,
} from "../../developer/reference/api/_shared/openapi.ts";
import type { Comp, Helpers } from "../../_types.d.ts";

const MAX_ENUM_VALUES = 30;

// Renders a response/request body as a link to its named schema page.
function SchemaReference({ reference }: { reference: SchemaTypeRef }) {
  return (
    <p className="c-api-schema-ref">
      {reference.isArray && "Array of "}
      <a href={reference.url}>
        <code className="code-no-box">{reference.name}</code>
      </a>
    </p>
  );
}

// Renders a labelled group of parameters as a dt/dd pair, matching the
// configuration reference's c-data-reference layout.
function Parameters(
  { title, params, helpers, idPrefix }: {
    title: string;
    params: ParameterView[];
    helpers?: Helpers;
    idPrefix?: string;
  },
) {
  if (!params.length) return null;
  return (
    <>
      <dt>{title}:</dt>
      <dd className="c-data-reference">
        {params.map((param) => {
          const enumValues = (param.enumValues ?? []).slice(0, MAX_ENUM_VALUES);
          const enumMore = (param.enumValues?.length ?? 0) - enumValues.length;
          const rowId = idPrefix ? `${idPrefix}--${param.name}` : undefined;
          return (
            <div className="c-data-reference__item" key={`${param.in}-${param.name}`}>
              <div className="c-data-reference__header" id={rowId}>
                <span className="c-data-reference__key">
                  <code className="code-no-box">{param.name}</code>
                </span>
                <code>{param.typeLabel}</code>
                {param.required && <small className="pill pill--red">Required</small>}
              </div>
              <div className="c-data-reference__description">
                {param.description && (
                  helpers
                    ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: helpers.md(param.description),
                        }}
                      />
                    )
                    : <div>{param.description}</div>
                )}
                {param.defaultValue !== undefined && (
                  <p>
                    <em>Defaults to:</em> <code>{param.defaultValue}</code>
                  </p>
                )}
                {enumValues.length > 0 && (
                  <p>
                    <em>Allowed values:</em>{" "}
                    {enumValues.map((val, i) => (
                      <span key={i}>
                        {i > 0 && " "}
                        <code>{val}</code>
                      </span>
                    ))}
                    {enumMore > 0 && ` and ${enumMore} more.`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </dd>
    </>
  );
}

interface ApiOperationProps {
  key?: string | number;
  operation: OperationView;
  helpers?: Helpers;
  comp: Comp;
}

export default function ApiOperation(
  { operation, helpers, comp }: ApiOperationProps,
) {
  const hasResponses = operation.responses.length > 0;

  return (
    <section className="c-api-operation" id={operation.id}>
      <h2 className="c-api-operation__title exclude-from-toc">
        {operation.title}
      </h2>
      <div className="c-api-operation__signature">
        <comp.Api.HttpMethod method={operation.method} />
        <code className="c-api-operation__path">{operation.path}</code>
      </div>

      {operation.deprecated && (
        <p>
          <small className="pill pill--warn">Deprecated</small>
        </p>
      )}

      {operation.description && (
        <div className="c-api-operation__description">
          {helpers
            ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: helpers.md(operation.description),
                }}
              />
            )
            : <div>{operation.description}</div>}
        </div>
      )}

      <dl>
        <Parameters
          title="Path parameters"
          params={operation.pathParams}
          helpers={helpers}
          idPrefix={operation.id}
        />
        <Parameters
          title="Filters"
          params={operation.filterParams}
          helpers={helpers}
          idPrefix={operation.id}
        />
        <Parameters
          title="Sorting"
          params={operation.sortParams}
          helpers={helpers}
          idPrefix={operation.id}
        />
        <Parameters
          title="Pagination"
          params={operation.paginationParams}
          helpers={helpers}
          idPrefix={operation.id}
        />
        <Parameters
          title="Query parameters"
          params={operation.queryParams}
          helpers={helpers}
          idPrefix={operation.id}
        />
        <Parameters
          title="Header parameters"
          params={operation.headerParams}
          helpers={helpers}
          idPrefix={operation.id}
        />

        {(operation.requestSchemaRef || operation.requestRows.length > 0) && (
          <>
            <dt>Request body:</dt>
            <dd>
              {operation.requestSchemaRef
                ? <SchemaReference reference={operation.requestSchemaRef} />
                : (
                  <comp.Api.ApiSchema
                    rows={operation.requestRows}
                    helpers={helpers}
                    idPrefix={operation.id}
                  />
                )}
            </dd>
          </>
        )}

        <dt>Example request:</dt>
        <dd>
          <comp.CodeBlock language="bash" source="Terminal">
            <pre><code className="language-bash">{operation.curl}</code></pre>
          </comp.CodeBlock>
        </dd>

        {hasResponses && (
          <>
            <dt>Responses:</dt>
            <dd>
              {operation.responses.map((response) => {
                const range = /^[1-5]/.test(response.status)
                  ? `${response.status[0]}xx`
                  : "other";
                return (
                  <details
                    className={`c-api-response c-api-response--${range}`}
                    key={response.status}
                  >
                    <summary className="c-api-response__header">
                      <span className="c-api-response__status">
                        {response.status}
                      </span>
                      {response.description && (
                        <span className="c-api-response__description">
                          {response.description}
                        </span>
                      )}
                      {response.example && helpers && (
                        <img
                          className="c-api-response__chevron"
                          src={helpers.icon("chevron_right:outlined", "material")}
                          inline="true"
                          alt=""
                        />
                      )}
                    </summary>
                    {response.example && (
                      <div className="c-api-response__body">
                        <comp.CodeBlock language="json" source="Response">
                          <pre><code className="language-json">{response.example}</code></pre>
                        </comp.CodeBlock>
                      </div>
                    )}
                  </details>
                );
              })}
            </dd>
          </>
        )}
      </dl>
    </section>
  );
}
