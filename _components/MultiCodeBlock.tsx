import yaml from 'npm:js-yaml@4'
import TOML from 'npm:@iarna/toml'
import LanguageIcon from './LanguageIcon.tsx';
import CodeBlockCopyButton from './CodeBlockCopyButton.tsx';

const buildError = (msg: string[]) => {
  console.error(msg.join('\n'));
  Deno.exit(1);
}

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
        console.warn(`MultiCodeBlock found a code block tagged with an unknown language ${lang}. Returning a normal code block.`);
    }
  } catch (_e) {
    buildError([`ERR: MultiCodeBlock found an unparseable code block tagged as the language ${lang}:\n${str}`]);
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
        console.warn(`MultiCodeBlock does not know how to transform code into the language ${lang}. Skipping.`);
        return null;
    }
  } catch (e) {
    console.warn(`MultiCodeBlock was unable to transform the following object into ${lang}:`);
    console.warn(JSON.stringify(obj, null, 2));
    console.warn(String(e));
    return null;
  }
}

const transform = (obj: unknown, lang: string, originalSource: string, annotations: unknown): [string, unknown] | null => {
  const code = stringifyToLanguage(obj, lang);
  if (!code) return null;
  const filenameParts = originalSource.split('.').reverse();
  filenameParts[0] = parseLanguageExtension(lang.toLowerCase());
  const new_source = filenameParts.length > 1
    ? filenameParts.reverse().join('.')
    : originalSource;
  return ([
    lang,
    codeBlock(code, lang, new_source, annotations)
  ]);
}

const tabNames: Record<string, string> = {
  javascript: 'JavaScript'
};

const tabButton = (tab: string) => {
  return (
    <button type="button" className="c-tabs__tab"
      alpine:click={`selectedTab = '${tab}'`}
      //{...{ ":aria-selected": `selectedTab === '${tab}'` }}
      role="tab"
      key={tab}>
      {tabNames[tab.toLowerCase()] || tab.toUpperCase()}
    </button>
  )
};

const tabPane = ([lang, codeBlock]: [string, unknown]) => {
  return (
    <div className="c-tab"
      x-data={`{
                tabName: '${lang}'
            }`}
      x-show="selectedTab === tabName"
      key={lang}>
      {codeBlock}
    </div>
  );
};

const codeBlock = (str: string, lang: string, source: string, annotations: unknown) => {
  const sourceDiv = source ? <div className="c-code-block__source">{source}</div> : null;
  const strippedStr = str.replace(/___\d+___/g, '');
  const codeEncoded = btoa(encodeURIComponent(strippedStr))
  return (
    <div x-data="{ highlighedAnnotation: null }">
      <div className={`c-code-block${annotations ? ` c-code-block--annotated` : ``}`}>
        <div className="c-code-block__heading">
          <LanguageIcon lang={lang} />
          {sourceDiv}
          <CodeBlockCopyButton codeEncoded={codeEncoded} />
        </div>
        <div className="c-code-block__code">
          <figure className="highlight">
            <pre><code className={`language-${lang}`}>
              {str.trim()}
            </code></pre>
          </figure>
        </div>
      </div>
      {annotations}
    </div>
  )
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

interface MultiCodeBlockProps {
    language: string;
    translate_into?: string[];
    source?: string;
    children: unknown;
}

export default function MultiCodeBlock({ language, translate_into = [], source, children }: MultiCodeBlockProps) {

  const code_block: unknown = Array.isArray(children) ? children[0] : children;
  let annotations: unknown = null;
  if (Array.isArray(children)) {
    annotations = (
      <div className="c-code-block__annotations">
        {children.slice(1)}
      </div>
    );
  }

  const code_str = extractCodeString(code_block);
  if (!code_str) {
    console.warn("MultiCodeBlock component encountered an empty code block (or another error). Skipping.");
    return null;
  }
  const parsed_code = parseFromLanguage(code_str, language);

  if (!translate_into.includes(language)) {
    translate_into.unshift(language);
  }

  const codeBlocks: [string, unknown][] = [];
  const tabButtons: unknown[] = [];

  if (!parsed_code) {
    codeBlocks.push([language, codeBlock(code_str, language, source || '', annotations)]);
  } else {
    for (const lang of translate_into) {
      const lang_child = transform(parsed_code, lang, source || '', annotations);
      if (lang_child) {
        codeBlocks.push(lang_child);
        tabButtons.push(tabButton(lang));
      }
    }
  }

  if (codeBlocks.length > 1) {
    return (
      <div className="c-tabs"
        x-data={`{
            selectedTab: "${language}"
        }`}>
        <div data-pagefind-ignore className="c-tabs__nav" role="tablist" aria-label="Code Block Syntax">
          {tabButtons}
        </div>
        {codeBlocks.map(tabPane)}
      </div>
    );
  } else {
    return (
      <>{codeBlocks[0][1]}</>
    )
  }
}
