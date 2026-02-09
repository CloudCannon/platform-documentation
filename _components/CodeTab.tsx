// Helper to extract code string from JSX children structure (code fence)
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

interface CodeTabProps {
  language: string;
  source?: string;
  code?: string; // For programmatic use (pre-parsed code string)
  codeEncoded?: string; // For programmatic use (pre-encoded for copy)
  children?: unknown; // For manual use (code fence in MDX)
}

export default function CodeTab(
  { language, code, children }: CodeTabProps,
) {
  // Determine the code content - either from code prop or extracted from children
  let codeContent: string;
  if (code !== undefined) {
    codeContent = code;
  } else if (children) {
    const extracted = extractCodeString(children);
    codeContent = extracted?.trim() ?? "";
  } else {
    codeContent = "";
  }

  return (
    <div
      className="c-code-block__panel"
      role="tabpanel"
      x-data={`{ tabLanguage: '${language}' }`}
      x-show={`selectedTab === tabLanguage`}
      tabIndex={0}
    >
      <div className="c-code-block__code">
        <figure className="highlight">
          <pre>
            <code className={`language-${language}`}>{codeContent}</code>
          </pre>
        </figure>
      </div>
    </div>
  );
}
