import yaml from "js-yaml";
import TOML from "@iarna/toml";
import CodeBlockCopyButton from "./CodeBlockCopyButton.tsx";
import CodeTabs, { getLanguageLabel } from "./CodeTabs.tsx";
import CodeTab from "./CodeTab.tsx";

const sentinalBread = "🥖";
const sentinalSandwich = (key: string) => {
  if (key.includes("-")) {
    return key;
  }

  return `${sentinalBread}${key}${sentinalBread}`;
};
const sandwichify = (obj: unknown): unknown => {
  if (obj) {
    if (Array.isArray(obj)) {
      return obj.map(sandwichify);
    }

    if (typeof obj === "object") {
      const record = obj as Record<string, unknown>;
      return Object.keys(record).reduce(
        (memo: Record<string, unknown>, key) => {
          memo[sentinalSandwich(key)] = sandwichify(record[key]);
          return memo;
        },
        {},
      );
    }
  }

  return obj;
};

const stringifyToJavascript = (obj: unknown): string => {
  const sandwich = sandwichify(obj);
  const str = JSON.stringify(sandwich, null, 2);
  const deconstructed = str.replace(new RegExp(`"${sentinalBread}`, "g"), "")
    .replace(new RegExp(`${sentinalBread}"`, "g"), "");

  return `module.exports = ${deconstructed};`;
};

const parseLanguageExtension = (lang: string): string => {
  switch (lang.toLowerCase()) {
    case "javascript":
      return "cjs";
    default:
      return lang;
  }
};

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
    console.warn(
      `CodeBlock: Could not parse ${lang} code for translation. Displaying as-is.`,
    );
    return undefined;
  }
};

const stringifyToLanguage = (obj: unknown, lang: string): string | null => {
  try {
    switch (lang.toLowerCase()) {
      case "yaml":
      case "yml":
        return yaml.dump(obj, {
          noRefs: true,
          "styles": {
            "!!null": "empty",
          },
        });
      case "json":
        return JSON.stringify(obj, null, 2);
      case "toml":
        return TOML.stringify(obj as TOML.JsonMap);
      case "javascript":
        return stringifyToJavascript(obj);
      default:
        console.warn(
          `CodeBlock does not know how to transform code into the language ${lang}. Skipping.`,
        );
        return null;
    }
  } catch (e) {
    console.warn(
      `CodeBlock was unable to transform the following object into ${lang}:`,
    );
    console.warn(JSON.stringify(obj, null, 2));
    console.warn(String(e));
    return null;
  }
};

interface CodeBlockData {
  lang: string;
  code: string;
  source: string;
  codeEncoded: string;
}

const transform = (
  obj: unknown,
  lang: string,
  originalSource: string,
): CodeBlockData | null => {
  const code = stringifyToLanguage(obj, lang);
  if (!code) return null;
  const filenameParts = originalSource.split(".").reverse();
  filenameParts[0] = parseLanguageExtension(lang.toLowerCase());
  const new_source = filenameParts.length > 1
    ? filenameParts.reverse().join(".")
    : originalSource;
  const strippedCode = code.replace(/___\d+___/g, "");
  return {
    lang,
    code: code.trim(),
    source: new_source,
    codeEncoded: btoa(encodeURIComponent(strippedCode)),
  };
};

// Language labels moved to CodeTabs.tsx

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

interface CodeBlockProps {
  language?: string;
  translate_into?: string[];
  source?: string;
  children: unknown;
}

export default function CodeBlock(
  { language = "plaintext", translate_into = [], source, children }:
    CodeBlockProps,
) {
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
    console.warn(
      "CodeBlock component encountered an empty code block (or another error). Skipping.",
    );
    return null;
  }

  // Only try to parse and translate if there are other languages to translate into
  const needsTranslation = translate_into.length > 0 &&
    !(translate_into.length === 1 &&
      translate_into[0].toLowerCase() === language.toLowerCase());

  const codeBlocks: CodeBlockData[] = [];

  if (needsTranslation) {
    const parsed_code = parseFromLanguage(code_str, language);

    if (parsed_code) {
      // Add source language first if not already in list
      if (
        !translate_into.map((l) => l.toLowerCase()).includes(
          language.toLowerCase(),
        )
      ) {
        translate_into.unshift(language);
      }

      // Multiple code blocks with translation
      for (const lang of translate_into) {
        const blockData = transform(parsed_code, lang, source || "");
        if (blockData) {
          codeBlocks.push(blockData);
        }
      }
    }
  }

  // If no translation happened (either not needed or failed), show single code block
  if (codeBlocks.length === 0) {
    const strippedCode = code_str.replace(/___\d+___/g, "");
    codeBlocks.push({
      lang: language,
      code: code_str.trim(),
      source: source || "",
      codeEncoded: btoa(encodeURIComponent(strippedCode)),
    });
  }

  // Single code block - show language as static tab for consistency
  if (codeBlocks.length === 1) {
    const block = codeBlocks[0];
    return (
      <div x-data="{ highlighedAnnotation: null }">
        <div
          className={`c-code-block${
            annotations ? ` c-code-block--annotated` : ``
          }`}
        >
          <div className="c-code-block__heading">
            <div className="c-code-block__tabs" data-pagefind-ignore>
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

  // Multiple code blocks - use CodeTabs component
  return (
    <div x-data="{ highlighedAnnotation: null }">
      <CodeTabs>
        {codeBlocks.map((block) => (
          <CodeTab
            language={block.lang}
            source={block.source}
            code={block.code}
            codeEncoded={block.codeEncoded}
          />
        ))}
      </CodeTabs>
      {annotations}
    </div>
  );
}
