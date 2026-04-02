import CodeBlockCopyButton from "./CodeBlockCopyButton.tsx";

const tabNames: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  shell: "Shell",
  bash: "Bash",
  markdown: "Markdown",
  ruby: "Ruby",
  python: "Python",
  go: "Go",
  jsx: "JSX",
  liquid: "Liquid",
  plaintext: "Text",
};

function getLanguageLabel(lang: string): string {
  return tabNames[lang.toLowerCase()] || lang.toUpperCase();
}

interface CodeTabChild {
  props?: {
    language?: string;
    source?: string;
    code?: string;
    codeEncoded?: string;
  };
}

interface CodeTabsProps {
  children: CodeTabChild | CodeTabChild[];
}

// Generate a unique ID for each CodeTabs instance
let codeTabsCounter = 0;
function generateUniqueId(): string {
  return `ct-${++codeTabsCounter}`;
}

export default function CodeTabs({ children }: CodeTabsProps) {
  const uniqueId = generateUniqueId();
  const childrenArray = Array.isArray(children) ? children : [children];

  // Extract tab info from children
  const tabs = childrenArray.map((child) => ({
    language: child?.props?.language ?? "plaintext",
    source: child?.props?.source ?? "",
    codeEncoded: child?.props?.codeEncoded ?? "",
  }));

  const defaultTab = tabs[0]?.language ?? "plaintext";

  // Build source and encoded maps for Alpine.js
  const sourcesMap = tabs.reduce((acc, tab) => {
    acc[tab.language] = tab.source;
    return acc;
  }, {} as Record<string, string>);

  const encodedMap = tabs.reduce((acc, tab) => {
    if (tab.codeEncoded) {
      acc[tab.language] = tab.codeEncoded;
    }
    return acc;
  }, {} as Record<string, string>);

  const hasEncodedContent = Object.keys(encodedMap).length > 0;
  const hasSource = tabs.some((tab) => tab.source);

  const tabButtonKeyboardHandler = `
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const tabs = Array.from($el.parentElement.querySelectorAll('[role=tab]'));
      const currentIndex = tabs.indexOf($el);
      let newIndex;
      if (event.key === 'ArrowRight') {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      }
      tabs[newIndex].focus();
      tabs[newIndex].click();
    }
  `;

  // Copy handler for when we don't have pre-encoded content
  const copyFromDomHandler = `
    const container = $el.closest('.c-code-block');
    const visiblePanel = container.querySelector('.c-code-block__panel:not([style*="display: none"])');
    if (visiblePanel) {
      const codeElement = visiblePanel.querySelector('code');
      if (codeElement) {
        const text = codeElement.innerText.trim();
        const encoded = btoa(encodeURIComponent(text));
        $clipboard(encoded);
      }
    }
  `;

  const tabButtons = tabs.map((tab) => (
    <button
      type="button"
      className="c-code-block__tab"
      role="tab"
      id={`${uniqueId}-tab-${tab.language}`}
      aria-controls={`${uniqueId}-panel-${tab.language}`}
      x-bind:aria-selected={`selectedTab === '${tab.language}' ? 'true' : 'false'`}
      x-bind:tabindex={`selectedTab === '${tab.language}' ? '0' : '-1'`}
      x-on-click={`selectedTab = '${tab.language}'`}
      x-on-keydown={tabButtonKeyboardHandler}
      key={tab.language}
    >
      {getLanguageLabel(tab.language)}
    </button>
  ));

  return (
    <div
      className="c-code-block c-code-block--tabbed"
      x-data={`{
        selectedTab: "${defaultTab}",
        sources: ${JSON.stringify(sourcesMap)},
        encoded: ${JSON.stringify(encodedMap)}
      }`}
    >
      <div className="c-code-block__heading">
        <div
          className="c-code-block__tabs"
          role="tablist"
          aria-label="Code syntax options"
          data-pagefind-ignore
        >
          {tabButtons}
        </div>
        {hasEncodedContent
          ? <CodeBlockCopyButton codeEncoded={tabs[0].codeEncoded} />
          : (
            <div className="c-code-block__copy" data-pagefind-ignore>
              <button
                type="button"
                x-on-click={copyFromDomHandler}
                className="c-code-block__copy__button"
                title="Copy to clipboard"
              >
                <svg
                  width="15"
                  height="17"
                  viewBox="0 0 15 17"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M12.75 15H4.5V4.5H12.75V15ZM12.75 3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H12.75C13.1478 16.5 13.5294 16.342 13.8107 16.0607C14.092 15.7794 14.25 15.3978 14.25 15V4.5C14.25 4.10218 14.092 3.72064 13.8107 3.43934C13.5294 3.15804 13.1478 3 12.75 3ZM10.5 0H1.5C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5V12H1.5V1.5H10.5V0Z" />
                </svg>
                <span>Copy</span>
              </button>
              <div
                className="c-code-block__copy__toast"
                role="status"
                aria-live="polite"
              >
                Copied to clipboard
              </div>
            </div>
          )}
      </div>

      {children}

      {hasSource && (
        <div className="c-code-block__footer">
          <span className="c-code-block__source" x-text="sources[selectedTab]">
          </span>
        </div>
      )}
    </div>
  );
}

export function toMarkdown(_props: CodeTabsProps, childrenMd: string): string {
  return childrenMd;
}

// Re-export the language label function for use by CodeBlock
export { getLanguageLabel };
