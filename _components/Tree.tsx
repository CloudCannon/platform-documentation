import InteractiveTree, { type TreeNode } from "./InteractiveTree.tsx";
import type { Helpers } from "../_types.d.ts";

interface TreeProps {
  children: unknown;
}

// Helper to extract code string from JSX children structure
function extractCodeString(node: unknown): string | undefined {
  if (!node || typeof node !== "object") return undefined;
  const elem = node as { props?: { children?: unknown } };
  if (elem.props?.children) {
    if (typeof elem.props.children === "string") {
      return elem.props.children;
    }
    return extractCodeString(elem.props.children);
  }
  return undefined;
}

// Parse the >> text format into TreeNode[]
// Format example:
// _component-library/
// >> components/
// >  >> sample/
// >     >> sample.eleventy.liquid
// >     >> sample.scss #*
// >> shared/
//    >> styles/
//       >> global.scss #*
//
// In this format:
// - Lines WITHOUT >> are root-level items
// - Lines WITH >> are children of the most recent folder
// - The position of >> determines nesting depth within children:
//   - >> at position 0 = direct child of previous folder
//   - >  >> (position 3) = grandchild
//   - etc.
// - Single > characters before >> are visual connectors (decoration)
function parseTreeText(text: string): TreeNode[] {
  const lines = text.trim().split("\n");
  const root: TreeNode[] = [];

  // Stack tracks: { indent level, children array to add to }
  // We use indent -1 for root, 0 for "child level", and position of >> for nested children
  const stack: { indent: number; children: TreeNode[] }[] = [
    { indent: -1, children: root },
  ];

  for (const line of lines) {
    if (!line.trim()) continue;

    // Find the position of >> which marks a child item
    const itemMarkerIndex = line.indexOf(">>");

    let label: string;
    let indent: number;
    let isChildItem: boolean;

    if (itemMarkerIndex === -1) {
      // No >> marker - this is a root-level item
      // Remove any stray > characters
      label = line.replace(/>/g, "").trim();
      indent = -1; // Root level
      isChildItem = false;
    } else {
      // Has >> marker - this is a child of the most recent folder
      label = line.substring(itemMarkerIndex + 2).trim();
      // Child items use the position of >> to determine their nesting level
      // >> at position 0 = first child level (indent 0)
      // >>    at position 3 = second child level (indent 3)
      indent = itemMarkerIndex;
      isChildItem = true;
    }

    // Skip empty labels
    if (!label) continue;

    // Check for annotation (e.g., #*, #1, #2)
    let annotation: string | undefined;
    const annotationMatch = label.match(/\s+#(\*|\d+)\s*$/);
    if (annotationMatch) {
      annotation = annotationMatch[1] === "*" ? "★" : annotationMatch[1];
      label = label.replace(/\s+#(\*|\d+)\s*$/, "");
    }

    // Check if it's a folder (ends with /)
    const isFolder = label.endsWith("/");
    if (isFolder) {
      label = label.slice(0, -1);
    }

    const node: TreeNode = {
      label,
      isFolder,
      annotation,
      children: isFolder ? [] : undefined,
    };

    if (!isChildItem) {
      // Root-level item: pop stack back to root and add there
      while (stack.length > 1) {
        stack.pop();
      }
      root.push(node);

      // If this root item is a folder, push it for potential >> children
      if (isFolder && node.children) {
        stack.push({ indent: -1, children: node.children });
      }
    } else {
      // Child item: find proper parent based on indent
      // Pop until we find a parent with lower indent
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      // Add node to current parent's children
      stack[stack.length - 1].children.push(node);

      // If this is a folder, push it onto stack for potential children
      if (isFolder && node.children) {
        stack.push({ indent, children: node.children });
      }
    }
  }

  return root;
}

export default function Tree({ children }: TreeProps, helpers: Helpers) {
  const text = extractCodeString(children) || "";
  const nodes = parseTreeText(text);

  return (
    <div className="c-code-block c-code-block--tree">
      <div className="c-code-block__code">
        <InteractiveTree nodes={nodes} helpers={helpers} defaultOpen />
      </div>
    </div>
  );
}

export { parseTreeText, type TreeNode };
