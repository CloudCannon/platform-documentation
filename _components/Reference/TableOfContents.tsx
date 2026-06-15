import {
  getDisplayName,
  getShortKey,
  resolveRef,
  type SectionId,
} from "./helpers.ts";
import { slugify } from "../utils/string-util.ts";
import type { DocEntry } from "../../_types.d.ts";

interface TocItem {
  id: string;
  labelElement: string;
}

function DocNameUnboxed(
  { doc }: { doc?: DocEntry },
): JSX.Component | string | undefined {
  if (doc) {
    return doc.title
      ? doc.title
      : <code className="code-no-box">{getShortKey(doc.key)}</code>;
  }
}

function getTocItems(entry: DocEntry, section: SectionId): TocItem[] {
  const items: TocItem[] = [];
  const hasProperties = entry.properties &&
    Object.keys(entry.properties).length > 0;

  if (entry.type === "object" || hasProperties) {
    const properties = Object.keys(entry.properties || {})
      .sort((a, b) => a.replace(/^_+/, "").localeCompare(b.replace(/^_+/, "")));
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
      items.push({
        id: `prop-${slugify(shortKey)}`,
        labelElement: <code className="code-no-box">{shortKey}</code>,
      });
    });

    if (additionalValues.length) {
      additionalValues.forEach((ref, i) => {
        const resolved = resolveRef(ref, section) || undefined;
        const label = resolved?.title || resolved?.full_key || `item-${i}`;
        items.push({
          id: `addvalue-${slugify(label)}`,
          labelElement: <DocNameUnboxed doc={resolved} />,
        });
      });
    } else {
      additionalProps.forEach((ref, i) => {
        const resolved = resolveRef(ref, section) || undefined;
        const label = resolved?.title || resolved?.full_key || `item-${i}`;
        items.push({
          id: `addprop-${slugify(label)}`,
          labelElement: <DocNameUnboxed doc={resolved} />,
        });
      });
    }
  } else if (entry.type === "array" && entry.items?.length) {
    entry.items.forEach((ref, i) => {
      const resolved = resolveRef(ref, section) || undefined;
      const label = getDisplayName(resolved) || `item-${i}`;
      items.push({
        id: `item-${slugify(label)}`,
        labelElement: <DocNameUnboxed doc={resolved} />,
      });
    });
  } else if (entry.anyOf?.length) {
    entry.anyOf.forEach((ref, i) => {
      const resolved = resolveRef(ref, section) || undefined;
      const label = getDisplayName(resolved) || `type-${i}`;
      items.push({
        id: `type-${slugify(label)}`,
        labelElement: <DocNameUnboxed doc={resolved} />,
      });
    });
  }

  return items;
}

export default function TableOfContents(
  { entry, section, withHeading = false }: {
    entry?: DocEntry;
    section: SectionId;
    withHeading?: boolean;
  },
): JSX.Component | undefined {
  if (!entry) {
    return;
  }

  const items = getTocItems(entry, section);

  if (items.length === 0) {
    return;
  }

  return (
    <>
      {withHeading && (
        <h3 className="l-toc__heading" data-pagefind-ignore>
          On this page
        </h3>
      )}
      <ol className="l-toc__list" data-pagefind-ignore>
        {items.map((item) => (
          <li
            key={item.id}
            x-bind:class={`visibleHeadingId === '${item.id}' ? 'active' : ''`}
          >
            <a href={`#${item.id}`}>{item.labelElement}</a>
          </li>
        ))}
      </ol>
    </>
  );
}
