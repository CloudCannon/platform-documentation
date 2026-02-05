import { getRefUrl, resolveRef, type SectionId } from "./helpers.ts";
import { DocEntry } from "./types.d.ts";

function DocName({ doc }: { doc: DocEntry }) {
  if (!doc) return null;
  return doc.title
    ? <span class="code-not-monospace">{doc.title}</span>
    : <code>{doc.key}</code>;
}

function MaybeLink(
  { href, shouldLink, children }: {
    href?: string | null;
    shouldLink: boolean;
    children: unknown;
  },
) {
  return shouldLink && href ? <a href={href}>{children}</a> : <>{children}</>;
}

function GenericParams({ children }: { children: unknown }) {
  return (
    <>
      <span className="u-opacity-half u-monospace">&lt;</span>
      {children}
      <span className="u-opacity-half u-monospace">&gt;</span>
    </>
  );
}

function TypeDisplay(
  { entry, currentUrl, section, nested = false }: {
    entry: DocEntry | null;
    currentUrl?: string;
    section: SectionId;
    nested?: boolean;
  },
) {
  if (!entry) return "unknown";

  const entryUrl = getRefUrl(entry, section);
  const shouldLink = nested && !!entryUrl && currentUrl !== entryUrl;

  if (nested && entryUrl && (entry.title || entry.key)) {
    return (
      <a href={entryUrl}>
        <DocName doc={entry} />
      </a>
    );
  }

  if (entry.type === "array") {
    const items = (entry.items?.map((ref) => resolveRef(ref, section)) || [])
      .filter((
        item,
      ): item is DocEntry => item !== null);
    return (
      <code>
        <MaybeLink href={entryUrl} shouldLink={shouldLink}>Array</MaybeLink>
        {items.length > 0 && (
          <GenericParams>
            {items.map((item, i) => (
              <>
                {i > 0 && <span className="u-opacity-half u-monospace">|</span>}
                <span key={item?.gid || i}>
                  <TypeDisplay
                    entry={item}
                    currentUrl={currentUrl}
                    section={section}
                    nested
                  />
                </span>
              </>
            ))}
          </GenericParams>
        )}
      </code>
    );
  }

  if (entry.type === "object") {
    const additionalProps = entry.additionalProperties || [];
    const resolvedProp = additionalProps.length === 1
      ? resolveRef(additionalProps[0], section)
      : null;
    return (
      <code>
        <MaybeLink href={entryUrl} shouldLink={shouldLink}>Object</MaybeLink>
        {resolvedProp && (
          <GenericParams>
            <TypeDisplay
              entry={resolvedProp}
              currentUrl={currentUrl}
              section={section}
              nested
            />
          </GenericParams>
        )}
      </code>
    );
  }

  if (entry.type === "string") {
    const display = <code>{entry.const ? `"${entry.const}"` : "string"}</code>;
    return (
      <MaybeLink href={entryUrl} shouldLink={shouldLink}>{display}</MaybeLink>
    );
  }

  if (entry.type === "number" || entry.type === "integer") {
    const display = (
      <code>
        {entry.const !== undefined ? String(entry.const) : entry.type}
      </code>
    );
    return (
      <MaybeLink href={entryUrl} shouldLink={shouldLink}>{display}</MaybeLink>
    );
  }

  if (entry.type === "boolean") {
    const display = (
      <code>{entry.const !== undefined ? String(entry.const) : "boolean"}</code>
    );
    return (
      <MaybeLink href={entryUrl} shouldLink={shouldLink}>{display}</MaybeLink>
    );
  }

  if (entry.anyOf?.length) {
    return (
      <>
        {entry.anyOf.map((ref, i) => {
          const resolved = resolveRef(ref, section);
          return (
            <>
              {i > 0 && <span className="u-opacity-half u-monospace">|</span>}
              <span key={resolved?.gid || i} className="anyof">
                <TypeDisplay
                  entry={resolved}
                  currentUrl={currentUrl}
                  section={section}
                  nested
                />
              </span>
            </>
          );
        })}
      </>
    );
  }

  const fallback = entry.type || (entry ? <DocName doc={entry} /> : "unknown");
  return (
    <MaybeLink href={entryUrl} shouldLink={shouldLink}>{fallback}</MaybeLink>
  );
}

export default function RefType(
  { doc, currentUrl, section }: {
    doc: DocEntry;
    currentUrl?: string;
    section: SectionId;
  },
) {
  if (!doc) return null;

  return (
    <>
      <TypeDisplay entry={doc} currentUrl={currentUrl} section={section} />
      {doc.required && " "}
      {doc.required && <small className="pill pill--red">Required</small>}
    </>
  );
}
