// Downloads the CloudCannon OpenAPI spec for the API reference docs.
//
// Mirrors download-permissions.js, with one difference: if the download fails
// or returns an unhealthy document, we keep the committed _data/openapi.json
// (the cached copy) and continue the build rather than failing it.
//
// Override the source with OPENAPI_URL, e.g. for staging or dev:
//   staging: https://staging-app.cloudcannon.io/api/v0/openapi.json
//   dev:     https://dev-app.cloudcannon.com/api/v0/openapi.json

const filepath = "_data/openapi.json";
const specUrl = Deno.env.get("OPENAPI_URL") ??
  "https://app.cloudcannon.com/api/v0/openapi.json";

const useCached = (reason) => {
  console.warn(`${reason}`);
  console.warn(`Falling back to the cached spec at ${filepath}.`);
};

const pullSpec = async () => {
  try {
    const req = await fetch(specUrl);
    if (!req.ok) {
      useCached(`OpenAPI spec at ${specUrl} returned ${req.status}.`);
      return;
    }

    const spec = await req.json();

    // Check for a healthy OpenAPI document before overwriting the cache.
    if (!spec?.openapi || !spec?.paths || !Object.keys(spec.paths).length) {
      useCached(
        `OpenAPI spec provided by CloudCannon at ${specUrl} has changed or errored ` +
          `(expected "openapi" and a non-empty "paths").`,
      );
      return;
    }

    Deno.writeTextFileSync(filepath, JSON.stringify(spec, null, 2));
    console.log(
      `Downloaded OpenAPI spec from ${specUrl} -> ${filepath} ` +
        `(${Object.keys(spec.paths).length} paths).`,
    );
  } catch (e) {
    useCached(`Failed to download OpenAPI spec from ${specUrl}: ${e}`);
  }
};

pullSpec();
