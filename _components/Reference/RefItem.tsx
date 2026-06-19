import {
  getDisplayName,
  getDisplayNamePair,
  getDocByGid,
  getRefUrl,
  getShortKey,
  resolveRef,
  type SectionId,
} from "./helpers.ts";
import RefType from "./RefType.tsx";
import MultiCodeBlock from "../MultiCodeBlock.tsx";
import Annotation from "../Annotation.tsx";
import type { DocEntry, Helpers } from "../../_types.d.ts";

const MAX_ENUM_VALUES = 10;

function appearsIn({ entry, section }: RefSummaryProps) {
  let gids = (entry.parent ? [entry.parent] : []).concat(
    entry.appears_in || [],
  ).filter((gid) => gid !== section);

  // The Visual Editor API cross-lists shared methods (e.g. addEventListener)
  // across every object that exposes them, so order the whole list
  // alphabetically. Other sections keep parent-first ordering (the structural
  // parent leads, then the other places the type appears).
  if (section === "type.VisualEditorAPI") {
    gids = [...gids].sort((a, b) => {
      const da = getDocByGid(a, section);
      const db = getDocByGid(b, section);
      const la = da ? getDisplayNamePair(da).label : a;
      const lb = db ? getDisplayNamePair(db).label : b;
      return la.localeCompare(lb);
    });
  }

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

  return (items.length > 0 && (
    <p data-pagefind-ignore>
      <em>
        {section === "type.VisualEditorAPI" ? "Available on:" : "Appears in:"}
      </em> {items}.
    </p>
  ));
}

interface RefSummaryProps {
  entry: DocEntry;
  section: SectionId;
  helpers?: Helpers;
  hideAppearsIn?: boolean;
}

function RefSummary(
  { entry, helpers, section, hideAppearsIn }: RefSummaryProps,
) {
  const examples = entry.documentation?.examples || [];
  const examplesWithCode = examples.filter((example) => example.code);
  const enumValues = entry.enum || [];
  const displayEnumCount = Math.min(enumValues.length, MAX_ENUM_VALUES);
  const enumMore = enumValues.length - displayEnumCount;

  return (
    <div class="c-data-reference__description">
      {entry.description && (
        helpers
          ? <div dangerouslySetInnerHTML={{ __html: helpers.md(entry.description) }} />
          : <div>{entry.description}</div>
      )}

      {section === "type.VisualEditorAPI" &&
        entry.type !== "object" &&
        entry.properties &&
        Object.keys(entry.properties).length > 0 && (
        <>
          <p data-pagefind-ignore><em>Parameters:</em></p>
          <ul class="c-data-reference__params">
            {Object.entries(entry.properties).map(([key, ref]) => {
              const param = resolveRef(ref, section);
              if (!param) return null;
              const descHtml = helpers && param.description
                ? helpers.md(param.description)
                  .replace(/^\s*<p>/, "").replace(/<\/p>\s*$/, "").trim()
                : null;
              return (
                <li key={key}>
                  <code class="code-no-box">{getShortKey(key)}</code>{" "}
                  <RefType doc={param} section={section} />
                  {param.description && (
                    <>
                      {" — "}
                      {descHtml !== null
                        ? <span dangerouslySetInnerHTML={{ __html: descHtml }} />
                        : param.description}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {entry.default !== undefined && (
        <p>
          <em>Defaults to:</em> <code>{String(entry.default)}</code>
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

      {!hideAppearsIn && appearsIn({ entry, section })}

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
                  ? <div dangerouslySetInnerHTML={{ __html: helpers.md(example.description) }} />
                  : <div>{example.description}</div>
              )}
              <MultiCodeBlock
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
                    <Annotation
                      key={j}
                      number={annotation.number || 0}
                      contentHtml={helpers.md(annotation.content || "")}
                    >
                    </Annotation>
                  ))}
              </MultiCodeBlock>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

interface RefItemProps {
  docRef: DocEntry | null | undefined;
  currentUrl?: string;
  section: SectionId;
  useKey?: boolean;
  keyOverride?: string;
  hideAppearsIn?: boolean;
  helpers?: Helpers;
}

export default function RefItem(
  {
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

  return (
    <>
      <div class="c-data-reference__header c-anchor-header">
        <span class="c-data-reference__key">
          <strong>
            {url ? <a href={url}>{label}</a> : label}
          </strong>
        </span>
        <RefType doc={doc} currentUrl={currentUrl} section={section} />
      </div>
      <RefSummary
        entry={doc}
        helpers={helpers}
        section={section}
        hideAppearsIn={hideAppearsIn}
      />
    </>
  );
}

export { RefSummary };
