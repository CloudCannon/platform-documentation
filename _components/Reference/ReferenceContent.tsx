import {
  getDisplayName,
  getDocByGid,
  getRefUrl,
  getShortKey,
  resolveRef,
  type SectionId,
} from "./helpers.ts";
import { slugify } from "../utils/index.ts";
import RefType from "./RefType.tsx";
import PropertiesTable from "./PropertiesTable.tsx";
import MultiCodeBlock from "../MultiCodeBlock.tsx";
import Annotation from "../Annotation.tsx";
import InteractiveTree, { type TreeNode } from "../InteractiveTree.tsx";
import type { DocEntry, Helpers } from "../../_types.d.ts";

interface TocItem {
  id: string;
  label: string;
}

interface ReferenceContentProps {
  entry: DocEntry;
  currentUrl: string;
  section: SectionId;
  helpers: Helpers;
  showDescription?: boolean;
  showAppearsIn?: boolean;
  showExamples?: boolean;
}

function DocName({ doc }: { doc?: DocEntry }) {
  if (!doc) return null;
  return doc.title ? doc.title : <code>{getShortKey(doc.key)}</code>;
}

function DocNameFull({ doc }: { doc?: DocEntry }) {
  if (!doc) return null;
  return doc.title ? doc.title : <code>{doc.key}</code>;
}

function DocLink({ doc, section }: { doc?: DocEntry; section: SectionId }) {
  if (!doc) return null;
  const url = getRefUrl(doc, section);

  return (
    <a href={url ?? undefined}>
      <DocName doc={doc} />
    </a>
  );
}

// Walk up from a gid to the root, returning array of gids from root to the gid
function walkToRoot(gid: string, section: SectionId): string[] {
  const path: string[] = [];
  let current: string | undefined = gid;

  while (current && current !== section) {
    path.unshift(current);
    const doc = getDocByGid(current, section);
    if (!doc) break;
    current = doc.parent;
  }

  return path;
}

// Collect all paths that lead to this doc (from parent and appears_in)
function collectPaths(doc: DocEntry, section: SectionId): string[][] {
  const paths: string[][] = [];

  // Path from doc.parent chain
  if (doc.parent && doc.parent !== section) {
    const path = walkToRoot(doc.parent, section);
    if (doc.gid) path.push(doc.gid);
    if (path.length > 0) paths.push(path);
  }

  // Paths from appears_in
  for (const gid of doc.appears_in || []) {
    if (gid === section) continue;
    const path = walkToRoot(gid, section);
    if (doc.gid) path.push(doc.gid);
    if (path.length > 0) paths.push(path);
  }

  return paths;
}

// Intermediate structure for building the tree
interface TreeBuildNode {
  gid: string;
  children: Map<string, TreeBuildNode>;
}

// Merge paths into a tree structure, then convert to TreeNode[]
function buildAppearsInTree(doc: DocEntry, section: SectionId): TreeNode[] {
  const paths = collectPaths(doc, section);
  if (paths.length === 0) return [];

  // Build intermediate tree with Maps for merging
  const root = new Map<string, TreeBuildNode>();

  for (const path of paths) {
    let currentLevel = root;
    for (const gid of path) {
      if (!currentLevel.has(gid)) {
        currentLevel.set(gid, { gid, children: new Map() });
      }
      currentLevel = currentLevel.get(gid)!.children;
    }
  }

  // Convert Map structure to TreeNode[]
  function convertToTreeNodes(map: Map<string, TreeBuildNode>): TreeNode[] {
    const nodes: TreeNode[] = [];
    for (const [_gid, buildNode] of map) {
      const docEntry = getDocByGid(buildNode.gid, section);
      const node: TreeNode = {
        label: getDisplayName(docEntry),
        href: getRefUrl(docEntry, section) ?? undefined,
        children: convertToTreeNodes(buildNode.children),
      };
      // Only set children if there are any
      if (node.children && node.children.length === 0) {
        node.children = undefined;
      }
      nodes.push(node);
    }
    return nodes;
  }

  return convertToTreeNodes(root);
}

function AppearsIn({
  doc,
  section,
  helpers,
}: {
  doc?: DocEntry;
  section: SectionId;
  helpers: Helpers;
}) {
  if (!doc) {
    return null;
  }
  const appearsIn = doc.appears_in || [];
  if (!doc.parent && appearsIn.length === 0) {
    return null;
  }

  const nodes = buildAppearsInTree(doc, section);
  if (nodes.length === 0) {
    return null;
  }

  return (
    <>
      <dt id="appears-in" data-pagefind-ignore>Appears in:</dt>
      <dd data-pagefind-ignore>
        <div className="c-code-block c-code-block--appears-in">
          <div className="c-code-block__code">
            <InteractiveTree
              nodes={nodes}
              helpers={helpers}
              defaultOpen
              iconMode="key"
            />
          </div>
        </div>
      </dd>
    </>
  );
}

export function getTocItems(entry: DocEntry, section: SectionId): TocItem[] {
  const items: TocItem[] = [];
  const hasProperties = entry.properties &&
    Object.keys(entry.properties).length > 0;

  if (entry.type === "object" || hasProperties) {
    const properties = Object.keys(entry.properties || {})
      .sort((a, b) => a.localeCompare(b));
    const additionalProps = entry.additionalProperties || [];
    let additionalValues: DocEntry[] = [];

    if (additionalProps.length === 1) {
      const resolved = resolveRef(additionalProps[0], section);
      if (resolved?.anyOf?.length) {
        additionalValues = resolved.anyOf;
      }
    }

    properties.forEach((key) => {
      const shortKey = getShortKey(key);
      items.push({ id: `prop-${slugify(shortKey)}`, label: shortKey });
    });

    if (additionalValues.length) {
      additionalValues.forEach((ref, i) => {
        const resolved = resolveRef(ref, section);
        const label = getDisplayName(resolved) || `item-${i}`;
        items.push({ id: `addvalue-${slugify(label)}`, label });
      });
    } else {
      additionalProps.forEach((ref, i) => {
        const resolved = resolveRef(ref, section);
        const label = getDisplayName(resolved) || `item-${i}`;
        items.push({ id: `addprop-${slugify(label)}`, label });
      });
    }
  } else if (entry.type === "array" && entry.items?.length) {
    entry.items.forEach((ref, i) => {
      const resolved = resolveRef(ref, section);
      const label = getDisplayName(resolved) || `item-${i}`;
      items.push({ id: `item-${slugify(label)}`, label });
    });
  } else if (entry.anyOf?.length) {
    entry.anyOf.forEach((ref, i) => {
      const resolved = resolveRef(ref, section);
      const label = getDisplayName(resolved) || `type-${i}`;
      items.push({ id: `type-${slugify(label)}`, label });
    });
  }

  return items;
}

export function TableOfContents(
  { items, withHeading = false }: { items: TocItem[]; withHeading?: boolean },
) {
  if (items.length === 0) return null;

  return (
    <>
      {withHeading && <h3 className="l-toc__heading" data-pagefind-ignore>Table of contents</h3>}
      <ol className="l-toc__list" data-pagefind-ignore>
        {items.map((item) => (
          <li
            key={item.id}
            x-bind:class={`visibleHeadingId === '${item.id}' ? 'active' : ''`}
          >
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ol>
    </>
  );
}

export default function ReferenceContent({
  entry,
  currentUrl,
  section,
  helpers,
  showDescription = true,
  showAppearsIn = true,
  showExamples = true,
}: ReferenceContentProps) {
  const examples = (entry.documentation?.examples || []).filter((ex) =>
    ex.code
  );

  return (
    <dl>
      {showDescription && (
        <>
          <dt
            id="description"
            className={!entry.description ? "show-in-cms" : undefined}
            data-pagefind-ignore
          >
            Description:
          </dt>
          <dd>
            {entry.description && (
              <span
                dangerouslySetInnerHTML={{
                  __html: helpers.md(entry.description),
                }}
              />
            )}
          </dd>
        </>
      )}

      {showAppearsIn && (
        <AppearsIn doc={entry} section={section} helpers={helpers} />
      )}

      {!entry.anyOf?.length && (
        <>
          <dt id="type" data-pagefind-ignore>Type:</dt>
          <dd data-pagefind-ignore>
            <RefType doc={entry} currentUrl={currentUrl} section={section} />
          </dd>
        </>
      )}

      {entry.default !== undefined && (
        <>
          <dt id="default-value" data-pagefind-ignore>Default value:</dt>
          <dd data-pagefind-ignore>
            <code>{String(entry.default)}</code>
          </dd>
        </>
      )}

      {entry.enum?.length && entry.enum.length > 0 && (
        <>
          <dt id="allowed-values" data-pagefind-ignore>Allowed values:</dt>
          {entry.enum.map((val, i) => (
            <dd key={i} data-pagefind-ignore>
              <code>{val}</code>
            </dd>
          ))}
        </>
      )}

      <PropertiesTable
        entry={entry}
        currentUrl={currentUrl}
        section={section}
        helpers={helpers}
        withIds
        slugify={slugify}
      />

      {showExamples && (
        <>
          <dt
            id="examples"
            className={!examples.length ? "show-in-cms" : undefined}
          >
            Examples:
          </dt>
          {examples.map((example, i) => (
            <dd key={i}>
              {example.description && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: helpers.md(example.description),
                  }}
                />
              )}
              <MultiCodeBlock
                language={example.language || "yaml"}
                source={example.source || "cloudcannon.config.yml"}
                translate_into={(!example.language ||
                    example.language === "yaml")
                  ? ["json"]
                  : []}
              >
                <pre>
                  <code className={`language-${example.language || "yaml"}`}>
                    {example.code}
                  </code>
                </pre>
                {example.annotations?.map((annotation, j) => (
                  <Annotation key={j} number={annotation.number || 0}>
                    {annotation.content}
                  </Annotation>
                ))}
              </MultiCodeBlock>
            </dd>
          ))}
        </>
      )}
    </dl>
  );
}

export { AppearsIn, DocLink, DocName, DocNameFull };
