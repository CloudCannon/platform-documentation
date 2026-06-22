import {
  getDisplayName,
  getDisplayNamePair,
  getDocByGid,
  getRefUrl,
  resolveRef,
  type SectionId,
} from "./helpers.ts";
import type { Comp, DocEntry, Helpers } from "../../_types.d.ts";

const MAX_ENUM_VALUES = 10;

function appearsIn(
  { doc, section }: { doc: DocEntry; section: SectionId },
): JSX.Component | undefined {
  const gids = (doc.parent ? [doc.parent] : []).concat(
    doc.appears_in || [],
  ).filter((gid) => gid !== section);

  const items = gids.flatMap((gid, i) => {
    const isLast = i === gids.length - 1;
    const doc = getDocByGid(gid, section);
    if (!doc) {
      return isLast ? [gid] : [gid, ", "];
    }

    const url = getRefUrl(doc, section);
    const { label, useCode } = getDisplayNamePair(doc);
    let text = useCode ? <code className="code-no-box">{label}</code> : label;

    if (!doc.title) {
      const parentDoc = doc.parent === section
        ? undefined
        : getDocByGid(doc.parent, section);

      if (parentDoc) {
        const { label: parentLabel, useCode: parentUseCode } =
          getDisplayNamePair(parentDoc);

        if (parentLabel) {
          const join = (parentUseCode && useCode)
            ? (label.startsWith("[") ? "" : ".")
            : " ";

          text = (
            <>
              {parentUseCode
                ? <code className="code-no-box">{parentLabel}</code>
                : parentLabel}
              {join}
              {text}
            </>
          );
        }
      }
    }

    const item = url
      ? <a href={url} key={gid} className="c-data-reference__link">{text}</a>
      : text;

    return isLast ? [item] : [item, ", "];
  });

  if (items.length !== 0) {
    return (
      <p data-pagefind-ignore>
        <em>Appears in:</em> {items}.
      </p>
    );
  }
}

interface RefItemProps {
  docRef: DocEntry | null | undefined;
  currentUrl?: string;
  section: SectionId;
  useKey?: boolean;
  keyOverride?: string;
  hideAppearsIn?: boolean;
  helpers?: Helpers;
  comp: Comp;
}

export default function RefItem(
  {
    comp,
    docRef,
    currentUrl,
    section,
    useKey = true,
    keyOverride,
    helpers,
    hideAppearsIn,
  }: RefItemProps,
) {
  const doc = resolveRef(docRef, section);
  if (!doc) {
    return null;
  }

  const url = getRefUrl(doc, section);
  const displayName = getDisplayName(doc);
  const key = keyOverride || doc.key;
  const label = useKey && key
    ? <code class="code-no-box">{key}</code>
    : displayName;

  const examples = doc.documentation?.examples || [];
  const examplesWithCode = examples.filter((example) => example.code);
  const enumValues = doc.enum || [];
  const displayEnumCount = Math.min(enumValues.length, MAX_ENUM_VALUES);
  const enumMore = enumValues.length - displayEnumCount;

  return (
    <>
      <div class="c-data-reference__header c-anchor-header">
        <span class="c-data-reference__key">
          <strong>
            {url ? <a href={url}>{label}</a> : label}
          </strong>
        </span>
        <comp.Reference.RefType
          doc={doc}
          currentUrl={currentUrl}
          section={section}
        />
      </div>
      <div class="c-data-reference__description">
        {doc.description && (
          helpers
            ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: helpers.md(doc.description),
                }}
              />
            )
            : <div>{doc.description}</div>
        )}

        {doc.default !== undefined && (
          <p>
            <em>Defaults to:</em> <code>{String(doc.default)}</code>
          </p>
        )}

        {displayEnumCount > 0 && (
          <p>
            <em>Allowed values:</em>{" "}
            {enumValues.slice(0, displayEnumCount).map((val, i) => (
              <span key={i}>
                {i > 0 && " "}
                <code>{val}</code>
              </span>
            ))}
            {enumMore > 0 && ` and ${enumMore} more.`}
          </p>
        )}

        {!hideAppearsIn && appearsIn({ doc, section })}

        {examplesWithCode.length > 0 && (
          <details className="c-example">
            <summary data-pagefind-ignore>
              <span class="__open">Show examples</span>
              <span class="__close">Hide examples</span>
            </summary>
            {examplesWithCode.map((example, i) => (
              <div key={i}>
                {example.description && (
                  helpers
                    ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: helpers.md(example.description),
                        }}
                      />
                    )
                    : <div>{example.description}</div>
                )}
                <comp.MultiCodeBlock
                  language={example.language || "yaml"}
                  source={example.source || "cloudcannon.config.yml"}
                  translate_into={(!example.language ||
                      example.language === "yaml")
                    ? ["json"]
                    : []}
                >
                  <pre><code className={`language-${example.language || 'yaml'}`}>
                                  {example.code}
                              </code></pre>
                  {helpers &&
                    example.annotations?.map((annotation, j) => (
                      <comp.Annotation
                        key={j}
                        number={annotation.number || 0}
                        contentHtml={helpers.md(annotation.content || "")}
                      >
                      </comp.Annotation>
                    ))}
                </comp.MultiCodeBlock>
              </div>
            ))}
          </details>
        )}
      </div>
    </>
  );
}
