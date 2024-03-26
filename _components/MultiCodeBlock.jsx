import yaml from 'npm:js-yaml@4'
import TOML from 'npm:@iarna/toml'
import LanguageIcon from './LanguageIcon.jsx';

const buildError = (msg) => {
  console.error(msg.join('\n'));
  Deno.exit(1);
}

const sentinalBread = '🥖';
const sentinalSandwich = (key) => {
  if (key.includes('-')) {
    return key;
  }

  return `${sentinalBread}${key}${sentinalBread}`
}
const sandwichify = (obj) => {
  if (obj) {
    if (Array.isArray(obj)) {
      return obj.map(sandwichify);
    }

    if (typeof obj === 'object') {
      return Object.keys(obj).reduce((memo, key) => {
        memo[sentinalSandwich(key)] = sandwichify(obj[key])
        return memo;
      }, {});
    }

  }

  return obj;
}


const stringifyToJavascript = (obj) => {
  const sandwich = sandwichify(obj);
  const str = JSON.stringify(sandwich, null, 2);
  const deconstructed = str.replace(new RegExp(`"${sentinalBread}`, 'g'), '')
    .replace(new RegExp(`${sentinalBread}"`, 'g'), '');

  return `module.exports = ${deconstructed};`;
}

const parseLanguageExtension = (lang) => {
  switch (lang.toLowerCase()){ 
    case "javascript":
      return "js";
    default:
      return lang
  }
}

const parseFromLanguage = (str, lang) => {
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
  } catch (e) {
    buildError([`ERR: MultiCodeBlock found an unparseable code block tagged as the language ${lang}:\n${str}`]);
  }
}

const stringifyToLanguage = (obj, lang) => {
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
        return TOML.stringify(obj);
      case "javascript":
        return stringifyToJavascript(obj);
      default:
        console.warn(`MultiCodeBlock does not know how to transform code into the language ${lang}. Skipping.`);
        return null;
    }
  } catch (e) {
    console.warn(`MultiCodeBlock was unable to transform the following object into ${lang}:`);
    console.warn(JSON.stringify(obj, null, 2));
    console.warn(e.toString());
    return null;
  }
}

const transform = (obj, lang, originalSource, annotations) => {
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

const tabNames = {
  javascript: 'JavaScript'
};

const tabButton = (tab) => {
  return (
    <button className="c-tabs__tab"
      alpine:click={`selectedTab = '${tab}'`}
      {...{ ":aria-selected": `selectedTab === '${tab}'` }}
      role="tab"
      key={tab}>
      {tabNames[tab] || tab.toUpperCase()}
    </button>
  )
}

const tabPane = ([lang, codeBlock]) => {
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
}

const codeBlock = (str, lang, source, annotations) => {
  source = source ? <div className="c-code-block__source">{source}</div> : <></>;
  const strippedStr = str.replace(/___\d+___/g, '');
  const codeEncoded = btoa(encodeURIComponent(strippedStr))
  return (
    <div x-data="{ highlighedAnnotation: null }">
      <div className={`c-code-block${annotations ? ` c-code-block--annotated` : ``}`}>
        <div className="c-code-block__heading">
          <LanguageIcon lang={lang} />
          {source}

          <div className="c-code-block__copy">
            <button x-on:click={`$clipboard('${codeEncoded}')`} className="c-code-block__copy__button" title="Copy contents">
              <svg width="15" height="17" viewBox="0 0 15 17" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.75 15H4.5V4.5H12.75V15ZM12.75 3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H12.75C13.1478 16.5 13.5294 16.342 13.8107 16.0607C14.092 15.7794 14.25 15.3978 14.25 15V4.5C14.25 4.10218 14.092 3.72064 13.8107 3.43934C13.5294 3.15804 13.1478 3 12.75 3ZM10.5 0H1.5C1.10218 0 0.720644 0.158035 0.43934 0.43934C0.158035 0.720644 0 1.10218 0 1.5V12H1.5V1.5H10.5V0Z"></path>
              </svg>
            </button>
            <div className="c-code-block__copy__toast">copied</div>
          </div>
        </div>
        <div className="c-code-block__code">
          <figure className="highlight">
            <pre><code className={`language-${lang}`}>
              {str}
            </code></pre>
          </figure>
        </div>
      </div>
      {annotations}
    </div>
  )
}

export default function ({ comp, language, translate_into = [], source, children }) {

  let code_block = children;
  let annotations = null;
  if (Array.isArray(children)) {
    code_block = children[0];
    annotations = (
      <div className="c-code-block__annotations">
        {children.slice(1)}
      </div>
    );
  }

  const code_str = code_block?.props?.children?.props?.children;
  if (!code_str) {
    console.warn("MultiCodeBlock component encountered an empty code block (or another error). Skipping.");
    return (<></>);
  }
  const parsed_code = parseFromLanguage(code_str, language);

  if (!translate_into.includes(language)) {
    translate_into.unshift(language);
  }

  const codeBlocks = [];
  const tabButtons = [];

  if (!parsed_code) {
    codeBlocks.push([language, codeBlock(code_str, language, source, annotations)]);
  } else {
    for (const lang of translate_into) {
      const lang_child = transform(parsed_code, lang, source, annotations);
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