import LanguageIcon from "./LanguageIcon.jsx";
import CodeBlockCopyButton from "./CodeBlockCopyButton.jsx";

export default function ({ comp, language, source, frameless = false, content, children }) {
  source = source ? <div className="c-code-block__source">{source}</div> : <></>;

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
  const codeEncoded = btoa(encodeURIComponent(code_str));
  let header = null;
  if (!frameless) {
    header = (
      <div className="c-code-block__heading">
          <LanguageIcon lang={language} />
          {source}
          <CodeBlockCopyButton codeEncoded={codeEncoded} />
        </div>
    );
  }

  return (
    <div x-data="{ highlighedAnnotation: null }">
      <div className={`c-code-block${annotations ? ` c-code-block--annotated` : ``}`}>
        {header}
        <div className={`c-code-block__code${frameless ? ` --frameless` : ``}`}>
          <figure className="highlight">
            <pre>
              <code className={`language-${language}`}>
                {code_str}
              </code>
            </pre>
          </figure>
        </div>
      </div>
      {annotations}
    </div>
  )
}