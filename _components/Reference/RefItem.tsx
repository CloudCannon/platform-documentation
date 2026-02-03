import {
  getDisplayName,
  getRefUrl,
  resolveRef,
  type SectionId,
} from "./helpers.ts";
import RefType from "./RefType.tsx";
import MultiCodeBlock from "../MultiCodeBlock.tsx";
import Annotation from "../Annotation.tsx";
import type { DocEntry, Helpers } from "../../_types.d.ts";

const MAX_ENUM_VALUES = 10;

interface RefSummaryProps {
  entry: DocEntry;
  helpers?: Helpers;
}

function RefSummary({ entry, helpers }: RefSummaryProps) {
  const examples = entry.documentation?.examples || [];
  const examplesWithCode = examples.filter((example) => example.code);
  const enumValues = entry.enum || [];
  const displayEnumCount = Math.min(enumValues.length, MAX_ENUM_VALUES);
  const enumMore = enumValues.length - displayEnumCount;

  return (
    <div class="c-data-reference__description">
      {entry.description && helpers && (
        <div
          dangerouslySetInnerHTML={{ __html: helpers.md(entry.description) }}
        />
      )}
      {entry.description && !helpers && <div>{entry.description}</div>}

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

      {examplesWithCode.length > 0 && (
        <details className="c-example">
          <summary data-pagefind-ignore>
            <span class="__open">Show examples</span>
            <span class="__close">Hide examples</span>
          </summary>
          {examplesWithCode.map((example, i) => (
            <div key={i}>
              {example.description && helpers && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: helpers.md(example.description),
                  }}
                />
              )}
              {example.description && !helpers && (
                <div>{example.description}</div>
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
                {example.annotations?.map((annotation, j) => (
                  <Annotation key={j} number={annotation.number || 0}>
                    {annotation.content}
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
  helpers?: Helpers;
}

export default function RefItem(
  { docRef, currentUrl, section, useKey = true, keyOverride, helpers }:
    RefItemProps,
) {
  const doc = resolveRef(docRef, section);
  if (!doc) return null;

  const url = getRefUrl(doc, section);
  const displayName = getDisplayName(doc);
  const key = keyOverride || doc.key;
  const label = useKey ? <code class="code-title">{key}</code> : displayName;

  return (
    <>
      <div class="c-data-reference__header c-anchor-header">
        <span class="c-data-reference__key">
          <strong>
            {url ? <a href={url}>{label}</a> : label}
          </strong>
        </span>
        {" — "}
        <RefType doc={doc} currentUrl={currentUrl} section={section} />
      </div>
      <RefSummary entry={doc} helpers={helpers} />
    </>
  );
}

export { RefSummary };
