// Transforms the vendored OpenAPI spec (developer/reference/api/_openapi.json)
// into view models the API reference layout and components render.
//
// The spec is generated from the app's Rails controllers (see app/doc/readme.md)
// and vendored here via `deno task sync-openapi`. Everything in this module is
// pure and memoised at module load, so importing it from _config.ts, the page
// generator, and the markdown-pages plugin all share the same parsed result.

import rawSpec from "../../../../_data/openapi.json" with { type: "json" };
import { slugify } from "../../../../_components/utils/string-util.ts";

// ---------------------------------------------------------------------------
// Spec types (only the parts we read)
// ---------------------------------------------------------------------------

export interface OpenApiSchema {
  $ref?: string;
  type?: string;
  format?: string;
  description?: string;
  nullable?: boolean;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  additionalProperties?: boolean | OpenApiSchema;
  allOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  example?: unknown;
}

interface OpenApiParameter {
  $ref?: string;
  name?: string;
  in?: "path" | "query" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
}

interface OpenApiMediaType {
  schema?: OpenApiSchema;
  example?: unknown;
}

interface OpenApiBody {
  $ref?: string;
  description?: string;
  required?: boolean;
  content?: Record<string, OpenApiMediaType>;
}

interface OpenApiResponse extends OpenApiBody {}

interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiBody;
  responses?: Record<string, OpenApiResponse>;
}

interface OpenApiSpec {
  openapi?: string;
  info?: { title?: string; version?: string; description?: string };
  servers?: { url?: string; description?: string }[];
  paths?: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
    parameters?: Record<string, OpenApiParameter>;
    responses?: Record<string, OpenApiResponse>;
    securitySchemes?: Record<string, OpenApiSecurityScheme>;
  };
  security?: Record<string, unknown>[];
}

interface OpenApiSecurityScheme {
  type?: string;
  name?: string;
  in?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// View models (what the components consume)
// ---------------------------------------------------------------------------

export interface SchemaRow {
  name: string;
  typeLabel: string;
  required: boolean;
  description?: string;
  nullable: boolean;
  enumValues?: string[];
  defaultValue?: string;
  children?: SchemaRow[];
}

export interface ParameterView {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  description?: string;
  typeLabel: string;
}

export interface ResponseView {
  status: string;
  description?: string;
  rows: SchemaRow[];
}

export interface OperationView {
  id: string;
  method: string;
  path: string;
  title: string;
  description?: string;
  deprecated: boolean;
  pathParams: ParameterView[];
  queryParams: ParameterView[];
  headerParams: ParameterView[];
  requestRows: SchemaRow[];
  requestExample?: string;
  responses: ResponseView[];
  curl: string;
}

export interface ApiResource {
  slug: string;
  title: string;
  description?: string;
  operations: OperationView[];
}

export interface ApiInfo {
  title: string;
  version: string;
  baseUrl: string;
  auth: {
    headerName: string;
    description?: string;
  } | null;
}

const spec = rawSpec as OpenApiSpec;

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
const MAX_DEPTH = 4;

// ---------------------------------------------------------------------------
// $ref resolution
// ---------------------------------------------------------------------------

function resolvePointer(ref: string): unknown {
  // Only local pointers (#/components/...) appear in this spec.
  if (!ref.startsWith("#/")) return undefined;
  const parts = ref.slice(2).split("/");
  let node: unknown = spec;
  for (const part of parts) {
    if (node && typeof node === "object") {
      node = (node as Record<string, unknown>)[decodeURIComponent(part)];
    } else {
      return undefined;
    }
  }
  return node;
}

function refName(ref: string): string {
  const parts = ref.split("/");
  return parts[parts.length - 1];
}

function resolveSchema(schema?: OpenApiSchema): OpenApiSchema | undefined {
  if (!schema) return undefined;
  if (schema.$ref) {
    return resolveSchema(resolvePointer(schema.$ref) as OpenApiSchema);
  }
  return schema;
}

function resolveParameter(param: OpenApiParameter): OpenApiParameter {
  if (param.$ref) {
    return resolvePointer(param.$ref) as OpenApiParameter ?? param;
  }
  return param;
}

function resolveResponse(resp: OpenApiResponse): OpenApiResponse {
  if (resp.$ref) {
    return resolvePointer(resp.$ref) as OpenApiResponse ?? resp;
  }
  return resp;
}

// ---------------------------------------------------------------------------
// Type labels
// ---------------------------------------------------------------------------

function typeLabel(schema?: OpenApiSchema): string {
  if (!schema) return "any";

  if (schema.$ref) {
    const resolved = resolveSchema(schema);
    // Prefer the named schema for readability (e.g. "SiteBlueprintFull").
    return refName(schema.$ref) || labelFromResolved(resolved);
  }

  return labelFromResolved(schema);
}

function labelFromResolved(schema?: OpenApiSchema): string {
  if (!schema) return "any";

  if (schema.const !== undefined) return JSON.stringify(schema.const);

  if (schema.enum?.length) {
    return "enum";
  }

  if (schema.allOf?.length) {
    const merged = mergeAllOf(schema);
    return labelFromResolved(merged);
  }

  const variants = schema.oneOf ?? schema.anyOf;
  if (variants?.length) {
    return variants.map((v) => typeLabel(v)).join(" | ");
  }

  if (schema.type === "array") {
    return `Array<${typeLabel(schema.items)}>`;
  }

  if (schema.type === "object" || schema.properties) {
    return "object";
  }

  if (schema.format) {
    return `${schema.type ?? "string"} (${schema.format})`;
  }

  return schema.type ?? "any";
}

function mergeAllOf(schema: OpenApiSchema): OpenApiSchema {
  if (!schema.allOf?.length) return schema;
  const properties: Record<string, OpenApiSchema> = {};
  const required: string[] = [];
  for (const part of schema.allOf) {
    const resolved = resolveSchema(part);
    if (!resolved) continue;
    Object.assign(properties, resolved.properties ?? {});
    if (resolved.required) required.push(...resolved.required);
  }
  // Allow sibling properties alongside allOf.
  Object.assign(properties, schema.properties ?? {});
  if (schema.required) required.push(...schema.required);
  return { type: "object", properties, required };
}

// ---------------------------------------------------------------------------
// Schema -> rows
// ---------------------------------------------------------------------------

function schemaToRows(
  schema: OpenApiSchema | undefined,
  depth = 0,
  seen: Set<string> = new Set(),
): SchemaRow[] {
  let resolved = resolveSchema(schema);
  if (!resolved) return [];

  if (resolved.allOf?.length) {
    resolved = mergeAllOf(resolved);
  }

  // Unwrap a top-level array into its item schema for property listing.
  if (resolved.type === "array" && resolved.items) {
    return schemaToRows(resolved.items, depth, seen);
  }

  const properties = resolved.properties;
  if (!properties) return [];

  const requiredSet = new Set(resolved.required ?? []);

  return Object.entries(properties).map(([name, propSchema]) => {
    const resolvedProp = resolveSchema(propSchema) ?? propSchema;
    const row: SchemaRow = {
      name,
      typeLabel: typeLabel(propSchema),
      required: requiredSet.has(name),
      description: resolvedProp.description,
      nullable: resolvedProp.nullable === true,
      enumValues: resolvedProp.enum?.map((v) => String(v)),
      defaultValue: resolvedProp.default !== undefined
        ? JSON.stringify(resolvedProp.default)
        : undefined,
    };

    // Recurse into nested objects (and arrays of objects) within a depth cap,
    // guarding against recursive schemas via the originating $ref name.
    const refKey = propSchema.$ref ?? "";
    const target = resolvedProp.type === "array"
      ? resolveSchema(resolvedProp.items)
      : resolvedProp;

    if (
      depth < MAX_DEPTH && target?.properties &&
      !(refKey && seen.has(refKey))
    ) {
      const nextSeen = refKey ? new Set(seen).add(refKey) : seen;
      const children = schemaToRows(target, depth + 1, nextSeen);
      if (children.length) row.children = children;
    }

    return row;
  });
}

// ---------------------------------------------------------------------------
// Example generation
// ---------------------------------------------------------------------------

function exampleValue(
  schema: OpenApiSchema | undefined,
  depth = 0,
  seen: Set<string> = new Set(),
): unknown {
  let resolved = resolveSchema(schema);
  if (!resolved) return null;

  if (resolved.example !== undefined) return resolved.example;
  if (resolved.const !== undefined) return resolved.const;
  if (resolved.default !== undefined) return resolved.default;
  if (resolved.enum?.length) return resolved.enum[0];

  if (resolved.allOf?.length) resolved = mergeAllOf(resolved);

  const variants = resolved.oneOf ?? resolved.anyOf;
  if (variants?.length) return exampleValue(variants[0], depth, seen);

  if (resolved.type === "array") {
    if (depth >= MAX_DEPTH) return [];
    return [exampleValue(resolved.items, depth + 1, seen)];
  }

  if (resolved.type === "object" || resolved.properties) {
    if (depth >= MAX_DEPTH) return {};
    const obj: Record<string, unknown> = {};
    for (const [name, propSchema] of Object.entries(resolved.properties ?? {})) {
      const refKey = propSchema.$ref ?? "";
      if (refKey && seen.has(refKey)) {
        obj[name] = null;
        continue;
      }
      const nextSeen = refKey ? new Set(seen).add(refKey) : seen;
      obj[name] = exampleValue(propSchema, depth + 1, nextSeen);
    }
    return obj;
  }

  return placeholderForScalar(resolved);
}

function placeholderForScalar(schema: OpenApiSchema): unknown {
  switch (schema.format) {
    case "uuid":
      return "00000000-0000-0000-0000-000000000000";
    case "date-time":
      return "2024-01-01T00:00:00Z";
    case "date":
      return "2024-01-01";
    case "email":
      return "user@example.com";
    case "uri":
    case "url":
      return "https://example.com";
  }
  switch (schema.type) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return 0;
    case "boolean":
      return true;
    default:
      return null;
  }
}

function requestBodySchema(op: OpenApiOperation): OpenApiSchema | undefined {
  const body = op.requestBody;
  if (!body) return undefined;
  const resolved = body.$ref
    ? resolvePointer(body.$ref) as OpenApiBody
    : body;
  return resolved?.content?.["application/json"]?.schema;
}

// ---------------------------------------------------------------------------
// cURL example
// ---------------------------------------------------------------------------

function authHeaderName(): string {
  const schemes = spec.components?.securitySchemes ?? {};
  const first = Object.values(schemes)[0];
  return first?.name ?? "X-API-KEY";
}

function baseUrl(): string {
  const production = spec.servers?.find((s) =>
    (s.description ?? "").toLowerCase().includes("production")
  );
  return (production ?? spec.servers?.[0])?.url ?? "https://app.cloudcannon.com";
}

function buildCurl(op: OpenApiOperation, method: string, path: string): string {
  const url = `${baseUrl()}${path}`;
  const lines: string[] = [`curl ${url} \\`];

  if (method.toUpperCase() !== "GET") {
    lines.push(`  -X ${method.toUpperCase()} \\`);
  }
  lines.push(`  -H "${authHeaderName()}: <your-api-key>" \\`);

  const bodySchema = requestBodySchema(op);
  if (bodySchema) {
    lines.push(`  -H "Content-Type: application/json" \\`);
    const example = exampleValue(bodySchema);
    const json = JSON.stringify(example, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : `  ${line}`))
      .join("\n");
    lines.push(`  -d '${json}'`);
  } else {
    // Drop the trailing line-continuation from the final header line.
    lines[lines.length - 1] = lines[lines.length - 1].replace(/ \\$/, "");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Operation + resource assembly
// ---------------------------------------------------------------------------

function humaniseAction(operationId: string | undefined, method: string): string {
  if (!operationId) return method.toUpperCase();
  const action = operationId.includes("_")
    ? operationId.slice(operationId.indexOf("_") + 1)
    : operationId;
  // Split CamelCase / snake_case into words.
  return action
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || method.toUpperCase();
}

function buildParameters(op: OpenApiOperation): {
  path: ParameterView[];
  query: ParameterView[];
  header: ParameterView[];
} {
  const path: ParameterView[] = [];
  const query: ParameterView[] = [];
  const header: ParameterView[] = [];

  for (const rawParam of op.parameters ?? []) {
    const param = resolveParameter(rawParam);
    if (!param.name || !param.in) continue;
    const view: ParameterView = {
      name: param.name,
      in: param.in,
      required: param.in === "path" ? true : param.required === true,
      description: param.description ?? param.schema?.description,
      typeLabel: typeLabel(param.schema),
    };
    if (param.in === "path") path.push(view);
    else if (param.in === "query") query.push(view);
    else if (param.in === "header") header.push(view);
  }

  return { path, query, header };
}

function buildResponses(op: OpenApiOperation): ResponseView[] {
  const responses = op.responses ?? {};
  return Object.entries(responses)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, rawResp]) => {
      const resp = resolveResponse(rawResp);
      const schema = resp.content?.["application/json"]?.schema;
      return {
        status,
        description: resp.description,
        rows: schemaToRows(schema),
      };
    });
}

function buildOperation(
  op: OpenApiOperation,
  method: string,
  path: string,
): OperationView {
  const params = buildParameters(op);
  const bodySchema = requestBodySchema(op);
  const requestRows = schemaToRows(bodySchema);
  const example = bodySchema ? exampleValue(bodySchema) : undefined;

  return {
    id: slugify(op.operationId ?? `${method}-${path}`),
    method: method.toUpperCase(),
    path,
    title: op.summary || op.description || humaniseAction(op.operationId, method),
    description: op.summary ? op.description : undefined,
    deprecated: op.deprecated === true,
    pathParams: params.path,
    queryParams: params.query,
    headerParams: params.header,
    requestRows,
    requestExample: example !== undefined
      ? JSON.stringify(example, null, 2)
      : undefined,
    responses: buildResponses(op),
    curl: buildCurl(op, method, path),
  };
}

let cachedResources: ApiResource[] | null = null;

function buildResources(): ApiResource[] {
  const byTag = new Map<string, OperationView[]>();

  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const op = methods[method];
      if (!op) continue;
      const tag = op.tags?.[0] ?? "Other";
      const view = buildOperation(op, method, path);
      const list = byTag.get(tag) ?? [];
      list.push(view);
      byTag.set(tag, list);
    }
  }

  const usedSlugs = new Set<string>();
  const resources: ApiResource[] = [];

  for (const tag of [...byTag.keys()].sort((a, b) => a.localeCompare(b))) {
    let slug = slugify(tag);
    while (usedSlugs.has(slug)) slug = `${slug}-x`;
    usedSlugs.add(slug);

    const operations = (byTag.get(tag) ?? []).sort((a, b) => {
      if (a.path !== b.path) return a.path.localeCompare(b.path);
      return a.method.localeCompare(b.method);
    });

    resources.push({ slug, title: tag, operations });
  }

  return resources;
}

export function getApiResources(): ApiResource[] {
  if (!cachedResources) cachedResources = buildResources();
  return cachedResources;
}

export function getApiResourceBySlug(slug: string): ApiResource | undefined {
  return getApiResources().find((r) => r.slug === slug);
}

export function getApiInfo(): ApiInfo {
  const scheme = Object.values(spec.components?.securitySchemes ?? {})[0];
  return {
    title: spec.info?.title ?? "CloudCannon API",
    version: spec.info?.version ?? "0.0.1",
    baseUrl: baseUrl(),
    auth: scheme
      ? { headerName: scheme.name ?? "X-API-KEY", description: scheme.description }
      : null,
  };
}

export const API_BASE_PATH = "/documentation/developer-reference/api/";

// ---------------------------------------------------------------------------
// Markdown serialisation (for the markdown-pages / llms.txt pipeline)
// ---------------------------------------------------------------------------

function rowsToMarkdown(rows: SchemaRow[], indent = 0): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];
  for (const row of rows) {
    const meta = [row.typeLabel];
    if (row.required) meta.push("required");
    if (row.nullable) meta.push("nullable");
    const desc = row.description ? ` — ${row.description.replace(/\s+/g, " ").trim()}` : "";
    lines.push(`${pad}- \`${row.name}\` (${meta.join(", ")})${desc}`);
    if (row.children?.length) {
      lines.push(rowsToMarkdown(row.children, indent + 1));
    }
  }
  return lines.join("\n");
}

function paramsToMarkdown(label: string, params: ParameterView[]): string {
  if (!params.length) return "";
  const lines = [`**${label}**`, ""];
  for (const param of params) {
    const meta = [param.typeLabel];
    if (param.required) meta.push("required");
    const desc = param.description
      ? ` — ${param.description.replace(/\s+/g, " ").trim()}`
      : "";
    lines.push(`- \`${param.name}\` (${meta.join(", ")})${desc}`);
  }
  return lines.join("\n") + "\n";
}

export function resourceToMarkdown(resource: ApiResource): string {
  const parts: string[] = [];

  for (const op of resource.operations) {
    parts.push(`## ${op.method} ${op.path}`);
    parts.push("");
    parts.push(op.title);
    if (op.description) {
      parts.push("");
      parts.push(op.description);
    }
    if (op.deprecated) {
      parts.push("");
      parts.push("> Deprecated.");
    }
    parts.push("");

    const params = [
      paramsToMarkdown("Path parameters", op.pathParams),
      paramsToMarkdown("Query parameters", op.queryParams),
      paramsToMarkdown("Header parameters", op.headerParams),
    ].filter(Boolean);
    if (params.length) {
      parts.push(params.join("\n"));
    }

    if (op.requestRows.length) {
      parts.push("**Request body**");
      parts.push("");
      parts.push(rowsToMarkdown(op.requestRows));
      parts.push("");
    }

    parts.push("**Example request**");
    parts.push("");
    parts.push("```bash");
    parts.push(op.curl);
    parts.push("```");
    parts.push("");

    if (op.responses.length) {
      parts.push("**Responses**");
      parts.push("");
      for (const response of op.responses) {
        const desc = response.description ? ` ${response.description}` : "";
        parts.push(`- \`${response.status}\`${desc}`);
        if (response.rows.length) {
          parts.push(rowsToMarkdown(response.rows, 1));
        }
      }
      parts.push("");
    }
  }

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
