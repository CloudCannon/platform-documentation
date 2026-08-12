import type { SchemaRow } from "../../developer/reference/api/_shared/openapi.ts";
import type { Comp, Helpers } from "../../_types.d.ts";

interface ApiSchemaProps {
  rows: SchemaRow[];
  helpers?: Helpers;
  comp: Comp;
  // When provided, each row gets id="{idPrefix}--{row.name}" so its anchor is
  // namespaced to the enclosing operation (or schema page). Without this, the
  // build-time post-processor auto-slugs from the row's key text and appends
  // -1, -2, … to disambiguate — which produces first-occurrence-wins anchors
  // that filter results can't reliably target.
  idPrefix?: string;
}

const MAX_ENUM_VALUES = 12;

function Row(
  { row, helpers, comp, idPrefix }: {
    key?: string | number;
    row: SchemaRow;
    helpers?: Helpers;
    comp: Comp;
    idPrefix?: string;
  },
) {
  const rowId = idPrefix ? `${idPrefix}--${row.name}` : undefined;
  const enumValues = row.enumValues ?? [];
  const shownEnum = enumValues.slice(0, MAX_ENUM_VALUES);
  const enumMore = enumValues.length - shownEnum.length;

  return (
    <div className="c-data-reference__item">
      <div className="c-data-reference__header" id={rowId}>
        <span className="c-data-reference__key">
          <code className="code-no-box">{row.name}</code>
        </span>
        {row.typeUrl
          ? <a href={row.typeUrl}><code>{row.typeLabel}</code></a>
          : <code>{row.typeLabel}</code>}
        {row.nullable && <small className="pill">Nullable</small>}
        {row.required && <small className="pill pill--red">Required</small>}
      </div>
      <div className="c-data-reference__description">
        {row.description && (
          helpers
            ? (
              <div
                dangerouslySetInnerHTML={{ __html: helpers.md(row.description) }}
              />
            )
            : <div>{row.description}</div>
        )}

        {row.defaultValue !== undefined && (
          <p>
            <em>Defaults to:</em> <code>{row.defaultValue}</code>
          </p>
        )}

        {shownEnum.length > 0 && (
          <p>
            <em>Allowed values:</em>{" "}
            {shownEnum.map((val, i) => (
              <span key={i}>
                {i > 0 && " "}
                <code>{val}</code>
              </span>
            ))}
            {enumMore > 0 && ` and ${enumMore} more.`}
          </p>
        )}

        {row.children && row.children.length > 0 && (
          <comp.Api.ApiSchema
            rows={row.children}
            helpers={helpers}
            idPrefix={idPrefix}
          />
        )}
      </div>
    </div>
  );
}

// Renders a flat or nested list of schema property rows using the existing
// c-data-reference styling shared with the configuration reference.
export default function ApiSchema(
  { rows, helpers, comp, idPrefix }: ApiSchemaProps,
) {
  if (!rows.length) return null;
  return (
    <div className="c-data-reference">
      {rows.map((row, i) => (
        <Row
          key={`${row.name}-${i}`}
          row={row}
          helpers={helpers}
          comp={comp}
          idPrefix={idPrefix}
        />
      ))}
    </div>
  );
}
