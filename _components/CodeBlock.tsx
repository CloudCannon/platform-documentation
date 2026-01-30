import yaml from 'npm:js-yaml@4.1.1'
import TOML from 'npm:@iarna/toml@2.2.5'
import CodeBlockCopyButton from './CodeBlockCopyButton.tsx';

const sentinalBread = '🥖';
const sentinalSandwich = (key: string) => {
  if (key.includes('-')) {
    return key;
  }

  return `${sentinalBread}${key}${sentinalBread}`
}
const sandwichify = (obj: unknown): unknown => {
  if (obj) {
    if (Array.isArray(obj)) {
      return obj.map(sandwichify);
    }

    if (typeof obj === 'object') {
      const record = obj as Record<string, unknown>;
      return Object.keys(record).reduce((memo: Record<string, unknown>, key) => {
        memo[sentinalSandwich(key)] = sandwichify(record[key])
        return memo;
      }, {});
    }

  }

  return obj;
}


const stringifyToJavascript = (obj: unknown): string => {
  const sandwich = sandwichify(obj);
  const str = JSON.stringify(sandwich, null, 2);
  const deconstructed = str.replace(new RegExp(`"${sentinalBread}`, 'g'), '')
    .replace(new RegExp(`${sentinalBread}"`, 'g'), '');

  return `module.exports = ${deconstructed};`;
}

const parseLanguageExtension = (lang: string): string => {
  switch (lang.toLowerCase()){ 
    case "javascript":
      return "cjs";
    default:
      return lang
  }
}

const parseFromLanguage = (str: string, lang: string): unknown => {
  try {
    switch (lang.toLowerCase()) {
      case "yaml":
      case "yml":
        return yaml.load(str);
      case "json":
        return JSON.parse(str);
      default:
        // Language doesn't support translation - return undefined
        return undefined;
    }
  } catch (_e) {
    // If parsing fails, log a warning and return undefined to fall back to raw code display
    console.warn(`CodeBlock: Could not parse ${lang} code for translation. Displaying as-is.`);
    return undefined;
  }
}

const stringifyToLanguage = (obj: unknown, lang: string): string | null => {
  try {
    switch (lang.toLowerCase()) {
      case "yaml":
      case "yml":
        return yaml.dump(obj, { 
          noRefs: true,
          'styles': {
            '!!null': 'empty'
          },
        });
      case "json":
        return JSON.stringify(obj, null, 2);
      case "toml":
        return TOML.stringify(obj as TOML.JsonMap);
      case "javascript":
        return stringifyToJavascript(obj);
      default:
        console.warn(`CodeBlock does not know how to transform code into the language ${lang}. Skipping.`);
        return null;
    }
  } catch (e) {
    console.warn(`CodeBlock was unable to transform the following object into ${lang}:`);
    console.warn(JSON.stringify(obj, null, 2));
    console.warn(String(e));
    return null;
  }
}

interface CodeBlockData {
  lang: string;
  code: string;
  source: string;
  codeEncoded: string;
}

const transform = (obj: unknown, lang: string, originalSource: string): CodeBlockData | null => {
  const code = stringifyToLanguage(obj, lang);
  if (!code) return null;
  const filenameParts = originalSource.split('.').reverse();
  filenameParts[0] = parseLanguageExtension(lang.toLowerCase());
  const new_source = filenameParts.length > 1
    ? filenameParts.reverse().join('.')
    : originalSource;
  const strippedCode = code.replace(/___\d+___/g, '');
  return {
    lang,
    code: code.trim(),
    source: new_source,
    codeEncoded: btoa(encodeURIComponent(strippedCode))
  };
}

const tabNames: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  shell: 'Shell',
  bash: 'Bash',
  markdown: 'Markdown',
  ruby: 'Ruby',
  python: 'Python',
  go: 'Go',
  jsx: 'JSX',
  liquid: 'Liquid',
  plaintext: 'Text',
};

function getLanguageLabel(lang: string): string {
  return tabNames[lang.toLowerCase()] || lang.toUpperCase();
}

// Helper to extract code string from JSX children structure
function extractCodeString(node: unknown): string | undefined {
  if (!node || typeof node !== 'object') return undefined;
  const elem = node as { props?: { children?: unknown } };
  if (elem.props?.children) {
    if (typeof elem.props.children === 'string') {
      return elem.props.children;
    }
    return extractCodeString(elem.props.children);
  }
  return undefined;
}

// Generate a unique ID for this code block instance
let codeBlockCounter = 0;
function generateUniqueId(): string {
  return `cb-${++codeBlockCounter}`;
}

interface CodeBlockProps {
    language?: string;
    translate_into?: string[];
    source?: string;
    children: unknown;
}

export default function CodeBlock({ language = 'plaintext', translate_into = [], source, children }: CodeBlockProps) {
  const uniqueId = generateUniqueId();
  
  const code_block: unknown = Array.isArray(children) ? children[0] : children;
  let annotations: unknown = null;
  if (Array.isArray(children) && children.length > 1) {
    annotations = (
      <div className="c-code-block__annotations">
        {children.slice(1)}
      </div>
    );
  }

  const code_str = extractCodeString(code_block);
  if (!code_str) {
    console.warn("CodeBlock component encountered an empty code block (or another error). Skipping.");
    return null;
  }

  // Only try to parse and translate if there are other languages to translate into
  const needsTranslation = translate_into.length > 0 && 
    !(translate_into.length === 1 && translate_into[0].toLowerCase() === language.toLowerCase());

  const codeBlocks: CodeBlockData[] = [];

  if (needsTranslation) {
    const parsed_code = parseFromLanguage(code_str, language);
    
    if (parsed_code) {
      // Add source language first if not already in list
      if (!translate_into.map(l => l.toLowerCase()).includes(language.toLowerCase())) {
        translate_into.unshift(language);
      }
      
      // Multiple code blocks with translation
      for (const lang of translate_into) {
        const blockData = transform(parsed_code, lang, source || '');
        if (blockData) {
          codeBlocks.push(blockData);
        }
      }
    }
  }
  
  // If no translation happened (either not needed or failed), show single code block
  if (codeBlocks.length === 0) {
    const strippedCode = code_str.replace(/___\d+___/g, '');
    codeBlocks.push({
      lang: language,
      code: code_str.trim(),
      source: source || '',
      codeEncoded: btoa(encodeURIComponent(strippedCode))
    });
  }

  // Single code block - show language as static tab for consistency
  if (codeBlocks.length === 1) {
    const block = codeBlocks[0];
    return (
      <div x-data="{ highlighedAnnotation: null }">
        <div className={`c-code-block${annotations ? ` c-code-block--annotated` : ``}`}>
          <div className="c-code-block__heading">
            <div className="c-code-block__tabs">
              <span className="c-code-block__tab c-code-block__tab--static">
                {getLanguageLabel(block.lang)}
              </span>
            </div>
            <CodeBlockCopyButton codeEncoded={block.codeEncoded} />
          </div>
          <div className="c-code-block__code">
            <figure className="highlight">
              <pre><code className={`language-${block.lang}`}>
                {block.code}
              </code></pre>
            </figure>
          </div>
          {block.source && (
            <div className="c-code-block__footer">
              <span className="c-code-block__source">{block.source}</span>
            </div>
          )}
        </div>
        {annotations}
      </div>
    );
  }

  // Multiple code blocks - tabbed interface
  // Build the sources map for Alpine.js
  const sourcesMap = codeBlocks.reduce((acc, block) => {
    acc[block.lang] = block.source;
    return acc;
  }, {} as Record<string, string>);

  // Build the encoded code map for Alpine.js (for copy button)
  const encodedMap = codeBlocks.reduce((acc, block) => {
    acc[block.lang] = block.codeEncoded;
    return acc;
  }, {} as Record<string, string>);

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

  return (
    <div 
      x-data={`{
        selectedTab: "${language}",
        sources: ${JSON.stringify(sourcesMap)},
        encoded: ${JSON.stringify(encodedMap)},
        highlighedAnnotation: null
      }`}
    >
      <div className={`c-code-block c-code-block--tabbed${annotations ? ` c-code-block--annotated` : ``}`}>
        <div className="c-code-block__heading">
          <div 
            className="c-code-block__tabs" 
            role="tablist" 
            aria-label="Code syntax options"
            data-pagefind-ignore
          >
            {codeBlocks.map((block) => (
              <button 
                type="button" 
                className="c-code-block__tab"
                role="tab"
                id={`${uniqueId}-tab-${block.lang}`}
                aria-controls={`${uniqueId}-panel-${block.lang}`}
                x-bind:aria-selected={`selectedTab === '${block.lang}' ? 'true' : 'false'`}
                x-bind:tabindex={`selectedTab === '${block.lang}' ? '0' : '-1'`}
                x-on:click={`selectedTab = '${block.lang}'`}
                x-on:keydown={tabButtonKeyboardHandler}
                key={block.lang}
              >
                {getLanguageLabel(block.lang)}
              </button>
            ))}
          </div>
          <CodeBlockCopyButton codeEncoded={codeBlocks[0].codeEncoded} />
        </div>
        
        {codeBlocks.map((block) => (
          <div 
            className="c-code-block__panel"
            role="tabpanel"
            id={`${uniqueId}-panel-${block.lang}`}
            aria-labelledby={`${uniqueId}-tab-${block.lang}`}
            x-show={`selectedTab === '${block.lang}'`}
            tabIndex={0}
            key={block.lang}
          >
            <div className="c-code-block__code">
              <figure className="highlight">
                <pre><code className={`language-${block.lang}`}>
                  {block.code}
                </code></pre>
              </figure>
            </div>
          </div>
        ))}
        
        {source && (
          <div className="c-code-block__footer">
            <span className="c-code-block__source" x-text="sources[selectedTab]"></span>
          </div>
        )}
      </div>
      {annotations}
    </div>
  );
}
