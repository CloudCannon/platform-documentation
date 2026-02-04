import {
  getDisplayName,
  getDocByGid,
  getRefUrl,
  getShortKey,
  resolveRef,
  type SectionId,
} from "./helpers.ts";
import { slugify } from "../utils/index.ts";
import RefType from "./RefType.tsx";
import PropertiesTable from "./PropertiesTable.tsx";
import MultiCodeBlock from "../MultiCodeBlock.tsx";
import Annotation from "../Annotation.tsx";
import type { DocEntry, Helpers } from "../../_types.d.ts";

interface TocItem {
  id: string;
  label: string;
}

interface ReferenceContentProps {
  entry: DocEntry;
  currentUrl: string;
  section: SectionId;
  helpers: Helpers;
  showDescription?: boolean;
  showAppearsIn?: boolean;
  showExamples?: boolean;
}

function DocName({ doc }: { doc?: DocEntry }) {
  if (!doc) return null;
  return doc.title ? doc.title : <code>{getShortKey(doc.key)}</code>;
}

function DocNameFull({ doc }: { doc?: DocEntry }) {
  if (!doc) return null;
  return doc.title ? doc.title : <code>{doc.key}</code>;
}

function DocLink({ doc, section }: { doc?: DocEntry; section: SectionId }) {
  if (!doc) return null;
  const url = getRefUrl(doc, section);

  return (
    <a href={url ?? undefined}>
      <DocName doc={doc} />
    </a>
  );
}

function RecursiveBreadcrumb(
  { gid, section }: { gid?: string; section: SectionId },
) {
  // Don't show breadcrumb for section root or missing gid
  if (!gid || gid === section) return null;

  const breadcrumbChain: DocEntry[] = [];
  let parent: string | undefined = gid;

  // Walk up parent chain, stopping at section root
  while (parent && parent !== section) {
    const parentDoc = getDocByGid(parent, section);
    if (!parentDoc) break;
    breadcrumbChain.unshift(parentDoc);
    parent = parentDoc.parent;
  }

  if (breadcrumbChain.length === 0) return null;

  return breadcrumbChain.map((crumb, i) => (
    <span key={crumb.gid || i}>
      {i > 0 && <span>&rarr;</span>}
      <DocLink doc={crumb} section={section} />
    </span>
  ));
}

function AppearsIn(
  { doc, section }: { doc?: DocEntry; section: SectionId },
) {
  if (!doc) {
    return null;
  }
  const appearsIn = doc.appears_in || [];
  if (!doc.parent && appearsIn.length === 0) {
    return null;
  }

  return (
    <>
      <dt id="appears-in">Appears in:</dt>
      {doc.parent && (
        <dd>
          <RecursiveBreadcrumb gid={doc.parent} section={section} />
        </dd>
      )}
      {appearsIn.map((gid) => {
        return (
          <dd key={gid}>
            <RecursiveBreadcrumb gid={gid} section={section} />
          </dd>
        );
      })}
      <dd></dd>
    </>
  );
}

export function getTocItems(entry: DocEntry, section: SectionId): TocItem[] {
  const items: TocItem[] = [];
  const hasProperties = entry.properties &&
    Object.keys(entry.properties).length > 0;

  if (entry.type === "object" || hasProperties) {
    const properties = Object.keys(entry.properties || {})
      .sort((a, b) => a.localeCompare(b));
    const additionalProps = entry.additionalProperties || [];
    let additionalValues: DocEntry[] = [];

    if (additionalProps.length === 1) {
      const resolved = resolveRef(additionalProps[0], section);
      if (resolved?.anyOf?.length) {
        additionalValues = resolved.anyOf;
      }
    }

    properties.forEach((key) => {
      const shortKey = getShortKey(key);
      items.push({ id: `prop-${slugify(shortKey)}`, label: shortKey });
    });

    if (additionalValues.length) {
      additionalValues.forEach((ref, i) => {
        const resolved = resolveRef(ref, section);
        const label = getDisplayName(resolved) || `item-${i}`;
        items.push({ id: `addvalue-${slugify(label)}`, label });
      });
    } else {
      additionalProps.forEach((ref, i) => {
        const resolved = resolveRef(ref, section);
        const label = getDisplayName(resolved) || `item-${i}`;
        items.push({ id: `addprop-${slugify(label)}`, label });
      });
    }
  } else if (entry.type === "array" && entry.items?.length) {
    entry.items.forEach((ref, i) => {
      const resolved = resolveRef(ref, section);
      const label = getDisplayName(resolved) || `item-${i}`;
      items.push({ id: `item-${slugify(label)}`, label });
    });
  } else if (entry.anyOf?.length) {
    entry.anyOf.forEach((ref, i) => {
      const resolved = resolveRef(ref, section);
      const label = getDisplayName(resolved) || `type-${i}`;
      items.push({ id: `type-${slugify(label)}`, label });
    });
  }

  return items;
}

export function TableOfContents(
  { items, withHeading = false }: { items: TocItem[]; withHeading?: boolean },
) {
  if (items.length === 0) return null;

  return (
    <>
      {withHeading && <h3 className="l-toc__heading">Table of contents</h3>}
      <ol className="l-toc__list">
        {items.map((item) => (
          <li
            key={item.id}
            x-bind:class={`visibleHeadingId === '${item.id}' ? 'active' : ''`}
          >
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ol>
    </>
  );
}

export default function ReferenceContent({
  entry,
  currentUrl,
  section,
  helpers,
  showDescription = true,
  showAppearsIn = true,
  showExamples = true,
}: ReferenceContentProps) {
  const examples = (entry.documentation?.examples || []).filter((ex) =>
    ex.code
  );

  return (
    <dl>
      {showDescription && (
        <>
          <dt
            id="description"
            className={!entry.description ? "show-in-cms" : undefined}
          >
            Description:
          </dt>
          <dd>
            {entry.description && (
              <span
                dangerouslySetInnerHTML={{
                  __html: helpers.md(entry.description),
                }}
              />
            )}
          </dd>
        </>
      )}

      {showAppearsIn && <AppearsIn doc={entry} section={section} />}

      {!entry.anyOf?.length && (
        <>
          <dt id="type">Type:</dt>
          <dd>
            <RefType doc={entry} currentUrl={currentUrl} section={section} />
          </dd>
        </>
      )}

      {entry.default !== undefined && (
        <>
          <dt id="default-value">Default value:</dt>
          <dd>
            <code>{String(entry.default)}</code>
          </dd>
        </>
      )}

      {entry.enum?.length && entry.enum.length > 0 && (
        <>
          <dt id="allowed-values">Allowed values:</dt>
          {entry.enum.map((val, i) => (
            <dd key={i}>
              <code>{val}</code>
            </dd>
          ))}
        </>
      )}

      <PropertiesTable
        entry={entry}
        currentUrl={currentUrl}
        section={section}
        helpers={helpers}
        withIds
        slugify={slugify}
      />

      {showExamples && (
        <>
          <dt
            id="examples"
            className={!examples.length ? "show-in-cms" : undefined}
          >
            Examples:
          </dt>
          {examples.map((example, i) => (
            <dd key={i}>
              {example.description && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: helpers.md(example.description),
                  }}
                />
              )}
              <MultiCodeBlock
                language={example.language || "yaml"}
                source={example.source || "cloudcannon.config.yml"}
                translate_into={(!example.language ||
                    example.language === "yaml")
                  ? ["json"]
                  : []}
              >
                <pre>
                  <code className={`language-${example.language || "yaml"}`}>
                    {example.code}
                  </code>
                </pre>
                {example.annotations?.map((annotation, j) => (
                  <Annotation key={j} number={annotation.number || 0}>
                    {annotation.content}
                  </Annotation>
                ))}
              </MultiCodeBlock>
            </dd>
          ))}
        </>
      )}
    </dl>
  );
}

export { AppearsIn, DocLink, DocName, DocNameFull };
