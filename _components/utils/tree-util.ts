export interface TreeNode {
  label: string;
  useCode?: boolean;
  href?: string;
  isFolder?: boolean;
  children?: TreeNode[];
  annotation?: string; // e.g., "1", "2", "*" for #1, #2, #*
}

// Convert nodes to ASCII text (used for screen readers and markdown output)
export function nodesToText(nodes: TreeNode[], prefix = ""): string {
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
