import {
  getApiSchemas,
  type SchemaDoc,
} from "./_shared/openapi.ts";

interface SchemaPageData {
  url: string;
  layout: string;
  schema: SchemaDoc;
  title: string;
  description: string;
}

// Generates one page per named component schema, so a schema is documented once
// and responses/request bodies link to it rather than re-expanding it.
export default function* (): Generator<SchemaPageData> {
  for (const schema of getApiSchemas()) {
    yield {
      url: `/developer-reference/api/schemas/${schema.slug}/`,
      layout: "layouts/api-schema.tsx",
      schema,
      title: schema.name,
      description: schema.description ||
        `The ${schema.name} schema in the CloudCannon API.`,
    };
  }
}
