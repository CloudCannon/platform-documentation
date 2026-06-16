import type {
  OperationView,
  ParameterView,
} from "../../developer/reference/api/_shared/openapi.ts";
import type { Comp, Helpers } from "../../_types.d.ts";

function Parameters(
  { title, params, helpers }: {
    title: string;
    params: ParameterView[];
    helpers?: Helpers;
  },
) {
  if (!params.length) return null;
  return (
    <>
      <h3 className="c-api-operation__subheading exclude-from-toc">{title}</h3>
      <div className="c-data-reference">
        {params.map((param) => (
          <div className="c-data-reference__item" key={`${param.in}-${param.name}`}>
            <div className="c-data-reference__header">
              <span className="c-data-reference__key">
                <code className="code-no-box">{param.name}</code>
              </span>
              <code>{param.typeLabel}</code>
              {param.required && <small className="pill pill--red">Required</small>}
            </div>
            {param.description && (
              <div className="c-data-reference__description">
                {helpers
                  ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: helpers.md(param.description),
                      }}
                    />
                  )
                  : <div>{param.description}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
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
      <div className="c-api-operation__signature">
        <comp.Api.HttpMethod method={operation.method} />
        <code className="c-api-operation__path">{operation.path}</code>
      </div>
      <p className="c-api-operation__title">{operation.title}</p>

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

      <Parameters
        title="Path parameters"
        params={operation.pathParams}
        helpers={helpers}
      />
      <Parameters
        title="Query parameters"
        params={operation.queryParams}
        helpers={helpers}
      />
      <Parameters
        title="Header parameters"
        params={operation.headerParams}
        helpers={helpers}
      />

      {operation.requestRows.length > 0 && (
        <>
          <h3 className="c-api-operation__subheading exclude-from-toc">
            Request body
          </h3>
          <comp.Api.ApiSchema rows={operation.requestRows} helpers={helpers} />
        </>
      )}

      <h3 className="c-api-operation__subheading exclude-from-toc">
        Example request
      </h3>
      <comp.CodeBlock language="bash" source="Terminal">
        <pre><code className="language-bash">{operation.curl}</code></pre>
      </comp.CodeBlock>

      {hasResponses && (
        <>
          <h3 className="c-api-operation__subheading exclude-from-toc">
            Responses
          </h3>
          {operation.responses.map((response) => (
            <div className="c-api-response" key={response.status}>
              <div className="c-api-response__header">
                <span className="c-api-response__status">{response.status}</span>
                {response.description && (
                  <span className="c-api-response__description">
                    {response.description}
                  </span>
                )}
              </div>
              {response.rows.length > 0 && (
                <comp.Api.ApiSchema rows={response.rows} helpers={helpers} />
              )}
            </div>
          ))}
        </>
      )}
    </section>
  );
}
