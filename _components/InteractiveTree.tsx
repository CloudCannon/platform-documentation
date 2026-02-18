import type { Helpers } from "../_types.d.ts";

export interface TreeNode {
  label: string;
  useCode?: boolean;
  href?: string;
  isFolder?: boolean;
  children?: TreeNode[];
  annotation?: string; // e.g., "1", "2", "*" for #1, #2, #*
}

// "folder" = folder/file icons, "key" = code/data_object icons for JSON keys
export type IconMode = "folder" | "key";

interface InteractiveTreeProps {
  nodes: TreeNode[];
  helpers: Helpers;
  defaultOpen?: boolean;
  className?: string;
  iconMode?: IconMode;
}

interface TreeBranchProps {
  node: TreeNode;
  helpers: Helpers;
  defaultOpen: boolean;
  iconMode: IconMode;
}

// Generate unique ID for accessibility
let treeIdCounter = 0;
function getTreeId() {
  return `tree-${++treeIdCounter}`;
}

// Convert nodes to ASCII text for screen readers
function nodesToText(nodes: TreeNode[], prefix = ""): string {
  return nodes
    .map((node, i) => {
      const isLast = i === nodes.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = prefix + (isLast ? "    " : "│   ");

      let line = prefix + connector + node.label;
      if (node.children?.length) {
        line += "\n" + nodesToText(node.children, childPrefix);
      }
      return line;
    })
    .join("\n");
}

function AnnotationMarker({ annotation }: { annotation?: string }) {
  if (!annotation) return null;
  return (
    <span
      className="code-annotation"
      data-annotation-number={annotation}
    >
      {annotation}
    </span>
  );
}

function getLeafIcon(iconMode: IconMode): string {
  if (iconMode === "key") {
    return "code:outlined";
  }
  return "description:outlined";
}

function getBranchIcons(iconMode: IconMode): { closed: string; open: string } {
  if (iconMode === "key") {
    return {
      closed: "data_object:outlined",
      open: "data_object:outlined",
    };
  }
  return {
    closed: "folder:outlined",
    open: "folder_open:outlined",
  };
}

function TreeBranch({ node, helpers, defaultOpen, iconMode }: TreeBranchProps) {
  const hasChildren = node.children && node.children.length > 0;
  const className = node.useCode === false ? "code-not-monospace" : undefined;
  const content = node.href
    ? <a href={node.href} class={className}>{node.label}</a>
    : <span class={className}>{node.label}</span>;

  if (!hasChildren) {
    const leafIcon = getLeafIcon(iconMode);
    return (
      <li className="c-tree__item" role="treeitem">
        <img
          src={helpers.icon(leafIcon, "material")}
          inline="true"
          aria-hidden="true"
        />
        {content}
        <AnnotationMarker annotation={node.annotation} />
      </li>
    );
  }

  const branchIcons = getBranchIcons(iconMode);

  return (
    <li className="c-tree__item" role="treeitem" aria-expanded="true">
      <details open={defaultOpen}>
        <summary>
          <span className="c-tree__icon" aria-hidden="true">
            <img
              className="c-tree__icon-closed"
              src={helpers.icon(branchIcons.closed, "material")}
              inline="true"
            />
            <img
              className="c-tree__icon-open"
              src={helpers.icon(branchIcons.open, "material")}
              inline="true"
            />
          </span>
          {content}
          <AnnotationMarker annotation={node.annotation} />
        </summary>
        <ul className="c-tree__children" role="group">
          {node.children!.map((child) => (
            <TreeBranch
              node={child}
              helpers={helpers}
              defaultOpen={defaultOpen}
              iconMode={iconMode}
            />
          ))}
        </ul>
      </details>
    </li>
  );
}

export default function InteractiveTree({
  nodes,
  helpers,
  defaultOpen = true,
  className,
  iconMode = "folder",
}: InteractiveTreeProps) {
  const treeId = getTreeId();
  const textTree = nodesToText(nodes);

  return (
    <div className={`c-tree-container ${className || ""}`}>
      {/* Visually hidden text for screen readers */}
      <div className="sr-only" id={treeId}>
        <pre>{textTree}</pre>
      </div>
      <ul
        className="c-tree"
        role="tree"
        aria-describedby={treeId}
      >
        {nodes.map((node) => (
          <TreeBranch
            node={node}
            helpers={helpers}
            defaultOpen={defaultOpen}
            iconMode={iconMode}
          />
        ))}
      </ul>
    </div>
  );
}

export function toMarkdown(
  { nodes }: InteractiveTreeProps,
): string {
  return `\`\`\`\n${nodesToText(nodes)}\n\`\`\`\n\n`;
}

export { nodesToText };
