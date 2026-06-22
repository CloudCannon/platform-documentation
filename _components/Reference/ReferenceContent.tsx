import {
  getDisplayNamePair,
  getDocByGid,
  getRefUrl,
  type SectionId,
} from "./helpers.ts";
import { slugify } from "../utils/string-util.ts";
import { type TreeNode } from "../utils/tree-util.ts";
import type { Comp, DocEntry, Helpers } from "../../_types.d.ts";

interface ReferenceContentProps {
  entry: DocEntry;
  currentUrl: string;
  section: SectionId;
  helpers: Helpers;
  showDescription?: boolean;
  showAppearsIn?: boolean;
  showExamples?: boolean;
  comp: Comp;
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
        ...getDisplayNamePair(docEntry),
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
  comp,
  doc,
  section,
  helpers,
}: {
  comp: Comp;
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
        <comp.InteractiveTree
          nodes={nodes}
          helpers={helpers}
          defaultOpen
          iconMode="key"
        />
      </dd>
    </>
  );
}

export default function ReferenceContent({
  comp,
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
    <>
      {entry.deprecated && (
        <comp.Notice info_type="important">
          {entry.deprecated_description
            ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: helpers.md(entry.deprecated_description),
                }}
              />
            )
            : "This key is deprecated: it is still supported, but no longer recommended."}
        </comp.Notice>
      )}

      <dl>
        {showDescription && (
          <>
            <dt id="description" data-pagefind-ignore>Description:</dt>
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
          <AppearsIn
            comp={comp}
            doc={entry}
            section={section}
            helpers={helpers}
          />
        )}

        {!entry.anyOf?.length && (
          <>
            <dt id="type" data-pagefind-ignore>Type:</dt>
            <dd data-pagefind-ignore>
              <comp.Reference.RefType doc={entry} currentUrl={currentUrl} section={section} />
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

        <comp.Reference.PropertiesTable
          entry={entry}
          currentUrl={currentUrl}
          section={section}
          helpers={helpers}
          withIds
          slugify={slugify}
        />

        {showExamples && (
          <>
            <dt id="examples">Examples:</dt>
            {examples.map((example, i) => (
              <dd key={i}>
                {example.description && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: helpers.md(example.description),
                    }}
                  />
                )}
                <comp.MultiCodeBlock
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
                    <comp.Annotation
                      key={j}
                      number={annotation.number || 0}
                      contentHtml={helpers.md(annotation.content || "")}
                    >
                    </comp.Annotation>
                  ))}
                </comp.MultiCodeBlock>
              </dd>
            ))}
          </>
        )}
      </dl>
    </>
  );
}
