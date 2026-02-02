import { getRefUrl, resolveRef } from "./helpers.ts";
import { DocEntry } from "./types.d.ts";

function DocName({ doc }: { doc: DocEntry }) {
  if (!doc) return null;
  return doc.title
    ? <span className="pill">{doc.title}</span>
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
      <span style={{ opacity: "0.5" }}>&lt;</span>
      {children}
      <span style={{ opacity: "0.5" }}>&gt;</span>
    </>
  );
}

function TypeDisplay(
  { entry, currentUrl, nested = false }: {
    entry: DocEntry | null;
    currentUrl?: string;
    nested?: boolean;
  },
) {
  if (!entry) return "unknown";

  const entryUrl = getRefUrl(entry);
  const shouldLink = nested && !!entryUrl && currentUrl !== entryUrl;

  if (nested && entryUrl && (entry.title || entry.key)) {
    return (
      <a href={entryUrl}>
        <DocName doc={entry} />
      </a>
    );
  }

  if (entry.type === "array") {
    const items = (entry.items?.map((ref) => resolveRef(ref)) || []).filter((
      item,
    ): item is DocEntry => item !== null);
    return (
      <>
        <MaybeLink href={entryUrl} shouldLink={shouldLink}>Array</MaybeLink>
        {items.length > 0 && (
          <GenericParams>
            {items.map((item, i) => (
              <span key={item?.gid || i}>
                {i > 0 && " | "}
                <TypeDisplay entry={item} currentUrl={currentUrl} nested />
              </span>
            ))}
          </GenericParams>
        )}
      </>
    );
  }

  if (entry.type === "object") {
    const additionalProps = entry.additionalProperties || [];
    const resolvedProp = additionalProps.length === 1
      ? resolveRef(additionalProps[0])
      : null;
    return (
      <>
        <MaybeLink href={entryUrl} shouldLink={shouldLink}>Object</MaybeLink>
        {resolvedProp && (
          <GenericParams>
            <TypeDisplay entry={resolvedProp} currentUrl={currentUrl} nested />
          </GenericParams>
        )}
      </>
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
          const resolved = resolveRef(ref);
          return (
            <span key={resolved?.gid || i} className="anyof">
              {i > 0 && " | "}
              <TypeDisplay entry={resolved} currentUrl={currentUrl} nested />
            </span>
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
  { doc, currentUrl }: { doc: DocEntry; currentUrl?: string },
) {
  if (!doc) return null;

  return (
    <>
      <TypeDisplay entry={doc} currentUrl={currentUrl} />
      {doc.required && (
        <small className="pill" style={{ color: "red" }}>Required</small>
      )}
    </>
  );
}
