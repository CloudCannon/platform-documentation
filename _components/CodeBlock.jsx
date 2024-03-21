import LanguageIcon from "./LanguageIcon.jsx";

export default function ({ comp, language, source, content, children }) {
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
  const codeEncoded = btoa(encodeURIComponent(code_str))

  return (
    <div x-data="{ highlighedAnnotation: null }">
      <div className={`c-code-block${annotations ? ` c-code-block--annotated` : ``}`}>
        <div className="c-code-block__heading">
          <LanguageIcon lang={language} />
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
            <pre>
              <code className={`language-${language}`}>
                {code_str.replace(/💃💃💃/g, "```")}
              </code>
            </pre>
          </figure>
        </div>
      </div>
      {annotations}
    </div>
  )
}