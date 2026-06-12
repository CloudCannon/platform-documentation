// Build-time parser that reads the Visual Editor API (VEAPI) TypeScript
// declarations and maps their JSDoc into the DocEntry shape used by the docs'
// reference machinery (globalThis.DOCS). The VEAPI repo stays lean (types
// only); the parsing responsibility lives here.
//
// Output is keyed under the section "type.VisualEditorAPI" and consumed by
// `comp.ReferenceDataRow` (article tables) and the reference page generator.

import {
  Project,
  type PropertySignature,
  type SourceFile,
  SyntaxKind,
} from "npm:ts-morph@23.0.0";
import type { CodeExample, DocEntry } from "../_types.d.ts";

export const VEAPI_SECTION = "type.VisualEditorAPI";

// Interfaces whose members we surface, in display order.
const ROOT_INTERFACE = "CloudCannonVisualEditorAPIV1";

// Option object types associated with a method: <methodName> -> interface name.
// These render as `<methodName>.options.<prop>` rows.
const OPTION_INTERFACES: Record<string, string> = {
  createCustomDataPanel: "CreateCustomDataPanelOptions",
};

// Interface types surfaced as their own reference pages, so method return types
// and properties can link between them recursively.
const SURFACED_INTERFACES = [
  "CloudCannonVisualEditorAPIV1File",
  "CloudCannonVisualEditorAPIV1FileData",
  "CloudCannonVisualEditorAPIV1FileContent",
  "CloudCannonVisualEditorAPIV1Collection",
  "CloudCannonVisualEditorAPIV1Dataset",
  "CloudCannonVisualEditorAPIV1TextEditableRegion",
];

// Friendly nav/page labels for the surfaced interface types (the type
// annotations themselves still show the full TypeScript name).
const INTERFACE_TITLES: Record<string, string> = {
  CloudCannonVisualEditorAPIV1File: "File",
  CloudCannonVisualEditorAPIV1FileData: "FileData",
  CloudCannonVisualEditorAPIV1FileContent: "FileContent",
  CloudCannonVisualEditorAPIV1Collection: "Collection",
  CloudCannonVisualEditorAPIV1Dataset: "Dataset",
  CloudCannonVisualEditorAPIV1TextEditableRegion: "TextEditableRegion",
};

// Synthetic nav root that groups the surfaced types into their own nav section.
export const VEAPI_OBJECTS_GID = "type.VisualEditorAPI.objects";

/**
 * Resolve the VEAPI `index.d.ts` to parse.
 *
 * For now this reads the sibling repo (`../visual-editor-api`), which is also
 * what `VEAPI_LOCAL` selects. The VEAPI package is currently unpublished
 * (0.0.0); once it is published and pinned in import_map.json/deno.lock, add an
 * npm-resolution branch here (preferred for CI) and keep the sibling path as
 * the `VEAPI_LOCAL` dev override.
 */
function resolveSourceUrl(): URL {
  return new URL("../../visual-editor-api/src/index.d.ts", import.meta.url);
}

interface JsDocInfo {
  description: string;
  examples: CodeExample[];
  deprecated: boolean;
  deprecatedDescription: string;
  params: { name: string; text: string }[];
  returns: string;
  throws: string[];
}

function emptyJsDoc(): JsDocInfo {
  return {
    description: "",
    examples: [],
    deprecated: false,
    deprecatedDescription: "",
    params: [],
    returns: "",
    throws: [],
  };
}

function parseExample(raw: string): CodeExample {
  const fenced = raw.match(/```(\w+)?\n([\s\S]*?)```/);
  const language = (fenced?.[1] ?? "javascript").toLowerCase();
  const code = (fenced ? fenced[2] : raw).trimEnd();
  const description = fenced
    ? raw.slice(0, fenced.index).trim()
    : "";
  return {
    code,
    language,
    source: language === "yaml" ? "cloudcannon.config.yml" : "script.js",
    description: description || undefined,
    annotations: [],
  };
}

// deno-lint-ignore no-explicit-any
function getJsDoc(node: any): JsDocInfo {
  const docs = node.getJsDocs?.() ?? [];
  if (docs.length === 0) return emptyJsDoc();
  const doc = docs[docs.length - 1];
  const info = emptyJsDoc();
  info.description = (doc.getDescription?.() ?? "").trim();

  for (const tag of doc.getTags?.() ?? []) {
    const tagName = tag.getTagName?.();
    const text = (tag.getCommentText?.() ?? "").trim();
    switch (tagName) {
      case "example":
        if (text) info.examples.push(parseExample(text));
        break;
      case "deprecated":
        info.deprecated = true;
        info.deprecatedDescription = text;
        break;
      case "returns":
      case "return":
        info.returns = text;
        break;
      case "throws":
        if (text) info.throws.push(text);
        break;
      case "param":
        info.params.push({
          name: tag.getName?.() ?? "",
          // JSDoc params are commonly written "@param name - description";
          // ts-morph keeps the leading "- " in the comment, so strip it to
          // avoid a doubled "— - " in the rendered output.
          text: text.replace(/^[-–—]\s*/, ""),
        });
        break;
    }
  }
  return info;
}

/** Compose a markdown description for a method from its JSDoc parts. */
function methodDescription(info: JsDocInfo): string {
  const parts: string[] = [];
  if (info.description) parts.push(info.description);
  if (info.params.length > 0) {
    parts.push(
      "**Parameters:**\n\n" +
        info.params
          .map((p) => `- \`${p.name}\`${p.text ? ` — ${p.text}` : ""}`)
          .join("\n"),
    );
  }
  if (info.returns) parts.push(`**Returns:** ${info.returns}`);
  if (info.throws.length > 0) {
    parts.push(`**Throws:** ${info.throws.join("; ")}`);
  }
  return parts.join("\n\n");
}

function makeEntry(opts: {
  gid: string;
  key: string;
  fullKey: string;
  parent: string;
  type: string;
  required: boolean;
  description: string;
  info: JsDocInfo;
}): DocEntry {
  const entry: DocEntry = {
    gid: opts.gid,
    key: opts.key,
    full_key: opts.fullKey,
    parent: opts.parent,
    type: opts.type,
    required: opts.required,
    description: opts.description,
    appears_in: [],
    documentation: {
      description: opts.description,
      examples: opts.info.examples,
      show_in_navigation: false,
    },
  };
  if (opts.info.examples.length > 0) entry.examples = opts.info.examples;
  if (opts.info.deprecated) {
    entry.deprecated = true;
    if (opts.info.deprecatedDescription) {
      entry.deprecated_description = opts.info.deprecatedDescription;
    }
  }
  return entry;
}

function propType(prop: PropertySignature): string {
  return prop.getTypeNode()?.getText() ?? "unknown";
}

/** Extract DocEntry rows for each property of an option object. */
function extractOptionProps(
  props: PropertySignature[],
  methodName: string,
  out: Record<string, DocEntry>,
  methodEntry?: DocEntry,
): void {
  const parentGid = methodName;
  for (const prop of props) {
    const name = prop.getName();
    const fullKey = `${methodName}.options.${name}`;
    const info = getJsDoc(prop);
    out[fullKey] = makeEntry({
      gid: fullKey,
      key: name,
      fullKey,
      parent: parentGid,
      type: propType(prop),
      required: !prop.hasQuestionToken(),
      description: info.description,
      info,
    });
    // Expose the option on the method's reference page as a child property.
    if (methodEntry) {
      methodEntry.properties ||= {};
      methodEntry.properties[name] = { gid: fullKey };
    }
  }
}

/**
 * Emit a reference entry for an interface type and one entry per member, so the
 * type gets its own page and its members render (with linkable types).
 */
function extractType(
  sf: SourceFile,
  interfaceName: string,
  out: Record<string, DocEntry>,
  typeProperties: Record<string, DocEntry>,
): void {
  const iface = sf.getInterface(interfaceName);
  if (!iface) return;

  const info = getJsDoc(iface);
  const properties: Record<string, DocEntry> = {};
  out[interfaceName] = {
    gid: interfaceName,
    key: interfaceName,
    title: INTERFACE_TITLES[interfaceName],
    full_key: interfaceName,
    url: `/visual-editor-api/${INTERFACE_TITLES[interfaceName] ?? interfaceName}/`,
    parent: VEAPI_SECTION,
    type: "object",
    required: false,
    description: info.description,
    properties,
    appears_in: [],
    documentation: {
      description: info.description,
      examples: info.examples,
      show_in_navigation: true,
    },
  };
  // Register the type in its own nav group.
  typeProperties[interfaceName] = { gid: interfaceName };

  for (const prop of iface.getProperties()) {
    const name = prop.getName();
    const gid = `${interfaceName}.${name}`;
    const pinfo = getJsDoc(prop);
    out[gid] = makeEntry({
      gid,
      key: name,
      fullKey: gid,
      parent: interfaceName,
      type: propType(prop),
      required: !prop.hasQuestionToken(),
      description: pinfo.description,
      info: pinfo,
    });
    properties[name] = { gid };
  }

  for (const method of iface.getMethods()) {
    const name = method.getName();
    if (name === "addEventListener" || name === "removeEventListener") continue;
    const gid = `${interfaceName}.${name}`;
    const minfo = getJsDoc(method);
    out[gid] = makeEntry({
      gid,
      key: name,
      fullKey: gid,
      parent: interfaceName,
      type: method.getReturnTypeNode()?.getText() ?? "void",
      required: false,
      description: methodDescription(minfo),
      info: minfo,
    });
    properties[name] = { gid };
  }
}

export function buildVeapiDocs(): Record<string, DocEntry> {
  try {
    const sourceText = Deno.readTextFileSync(resolveSourceUrl());
    const project = new Project({
      useInMemoryFileSystem: true,
      skipAddingFilesFromTsConfig: true,
      compilerOptions: { skipLibCheck: true, noResolve: true },
    });
    const sf = project.createSourceFile("index.d.ts", sourceText);
    const out: Record<string, DocEntry> = {};

    // Root entry (the v1 API surface).
    const rootProperties: Record<string, DocEntry> = {};
    out[VEAPI_SECTION] = {
      gid: VEAPI_SECTION,
      key: "Visual Editor API",
      title: "Visual Editor API",
      full_key: VEAPI_SECTION,
      type: "object",
      description:
        "Methods exposed by the v1 Visual Editor API, available via `window.CloudCannonAPI.useVersion('v1', true)`.",
      properties: rootProperties,
      appears_in: [],
      documentation: { show_in_navigation: true },
    };

    const root = sf.getInterface(ROOT_INTERFACE);
    if (!root) {
      console.warn(
        `[veapi-docs] Root interface ${ROOT_INTERFACE} not found; emitting empty section.`,
      );
      return out;
    }

    for (const method of root.getMethods()) {
      const name = method.getName();
      // addEventListener/removeEventListener are low-signal overloaded noise.
      if (name === "addEventListener" || name === "removeEventListener") {
        continue;
      }
      const info = getJsDoc(method);
      const returnType = method.getReturnTypeNode()?.getText() ?? "void";
      const methodEntry = makeEntry({
        gid: name,
        key: name,
        fullKey: name,
        parent: VEAPI_SECTION,
        type: returnType,
        required: false,
        description: methodDescription(info),
        info,
      });
      // Methods have no url: they are listed in the overview's methods table
      // rather than each getting a dedicated page.
      out[name] = methodEntry;
      rootProperties[name] = { gid: name };

      // Associated option-object interface, if any.
      const optionInterfaceName = OPTION_INTERFACES[name];
      if (optionInterfaceName) {
        const optIface = sf.getInterface(optionInterfaceName);
        if (optIface) {
          extractOptionProps(optIface.getProperties(), name, out, methodEntry);
        }
      }

      // Inline options object literal on the 3rd parameter (e.g.
      // createTextEditableRegion(element, onChange, options?: { ... })).
      const lastParam = method.getParameters().at(-1);
      const literal = lastParam?.getTypeNode()?.asKind(SyntaxKind.TypeLiteral);
      if (literal && lastParam?.getName() === "options") {
        extractOptionProps(literal.getProperties(), name, out, methodEntry);
      }
    }

    // Surface the interface types referenced by method return types and
    // properties, so the reference can link recursively between them.
    const typeProperties: Record<string, DocEntry> = {};
    for (const interfaceName of SURFACED_INTERFACES) {
      extractType(sf, interfaceName, out, typeProperties);
    }
    // Synthetic nav root so the surfaced types get their own nav group
    // (it has no url, so the page generator skips it).
    out[VEAPI_OBJECTS_GID] = {
      gid: VEAPI_OBJECTS_GID,
      key: "objects",
      full_key: VEAPI_OBJECTS_GID,
      parent: VEAPI_SECTION,
      properties: typeProperties,
      appears_in: [],
    };

    return out;
  } catch (err) {
    console.warn(`[veapi-docs] Failed to build VE API docs: ${err}`);
    return {};
  }
}

if (import.meta.main) {
  const docs = buildVeapiDocs();
  const keys = Object.keys(docs).sort();
  console.log(`[veapi-docs] ${keys.length} entries`);
  for (const k of keys) {
    const e = docs[k];
    console.log(
      `  ${k}  (type=${e.type ?? "?"}, required=${e.required ?? "-"}, desc=${
        e.description ? e.description.slice(0, 48).replace(/\n/g, " ") + "…" : "∅"
      })`,
    );
  }
}
