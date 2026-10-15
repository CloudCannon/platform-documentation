// Downloads the CloudCannon OpenAPI spec for the API reference docs.
//
// Mirrors download-permissions.ts, with one difference: if the download fails
// or returns an unhealthy document, we keep the committed _data/openapi.json
// (the cached copy) and continue the build rather than failing it.
//
// Override the source with OPENAPI_URL, e.g. for staging or dev:
//   staging: 'https://cdn.cloudcannon.com/openapi/staging.json',
//   production: 'https://cdn.cloudcannon.com/openapi/production.json'

import { blue, bold, red } from "@std/fmt/colors";

const LOG_PREFIX = blue("[download-openapi]");
const WARN_PREFIX = red("[download-openapi]");

const filepath = "_data/openapi.json";
const specUrl = Deno.env.get("OPENAPI_URL") ??
  "https://cdn.cloudcannon.com/openapi/staging.json";

const useCached = (reason: string) => {
  console.warn(`${WARN_PREFIX} ${reason}`);
  console.warn(
    `${WARN_PREFIX} falling back to the cached spec at ${bold(filepath)}`,
  );
};

const pullSpec = async () => {
  try {
    const req = await fetch(specUrl);
    if (!req.ok) {
      useCached(`OpenAPI spec at ${bold(specUrl)} returned ${req.status}`);
      return;
    }

    const spec = await req.json();

    // Check for a healthy OpenAPI document before overwriting the cache.
    if (!spec?.openapi || !spec?.paths || !Object.keys(spec.paths).length) {
      useCached(
        `OpenAPI spec at ${bold(specUrl)} has changed or errored ` +
          `(expected "openapi" and a non-empty "paths")`,
      );
      return;
    }

    Deno.writeTextFileSync(filepath, JSON.stringify(spec, null, 2));
    console.log(
      `${LOG_PREFIX} downloaded OpenAPI spec from ${bold(specUrl)} to ${bold(filepath)} ` +
        `(${Object.keys(spec.paths).length} paths)`,
    );
  } catch (e) {
    useCached(`failed to download OpenAPI spec from ${bold(specUrl)}: ${e}`);
  }
};

pullSpec();
