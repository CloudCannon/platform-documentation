const tree = (str: string, placeholder = ">") => {
  const lines = str.split("\n");

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l].split("");
    for (let c = 0; c < line.length; c++) {
      if (line[c] !== placeholder) continue;

      const _lineAbove = lines[l - 1]?.[c] === placeholder;
      const lineBelow = lines[l + 1]?.[c] === placeholder;
      const lineLeft = lines[l][c - 1] === placeholder;
      const lineRight = lines[l][c + 1] === placeholder;

      if (lineLeft) {
        line[c] = "─";
      } else if (lineBelow && lineRight) {
        line[c] = "├";
      } else if (lineBelow) {
        line[c] = "│";
      } else {
        line[c] = "└";
      }
    }
    lines[l] = line.join("");
  }

  return lines.join("\n");
};

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

export default function Tree({ children }: TreeProps) {
  const code_str = extractCodeString(children) || "";
  const tree_str = tree(code_str);
  return (
    <div className="c-code-block">
      <div className="c-code-block__code">
        <figure className="highlight">
          <pre>
            <code className={`language-tree`}>
              {tree_str}
            </code>
          </pre>
        </figure>
      </div>
    </div>
  );
}
