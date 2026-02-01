import { getDisplayName, resolveRef } from "./helpers.ts";
import RefItem from "./RefItem.tsx";
import type { DocEntry, Helpers } from "../../_types.d.ts";

interface PropertiesTableProps {
  entry: DocEntry;
  currentUrl?: string;
  helpers?: Helpers;
  withIds?: boolean;
  slugify?: (str: string) => string;
}

function ObjectProperties(
  { entry, currentUrl, helpers, withIds, slugify }: PropertiesTableProps,
) {
  const properties = Object.entries(entry.properties || {});
  const additionalProps = entry.additionalProperties || [];

  return (
    <>
      <dt id={withIds ? "properties" : undefined}>Properties:</dt>
      {properties.length > 0
        ? (
          properties.map(([key, ref]) => (
            <dd
              key={key}
              id={withIds && slugify ? `prop-${slugify(key)}` : undefined}
            >
              <RefItem
                docRef={ref}
                currentUrl={currentUrl}
                useKey
                keyOverride={key}
                helpers={helpers}
              />
            </dd>
          ))
        )
        : (
          <dd>
            <p>There are no reserved properties.</p>
          </dd>
        )}

      {additionalProps.length > 0 && (
        <>
          <dt id={withIds ? "additional-properties" : undefined}>
            Additional properties:
          </dt>
          {additionalProps.map((ref, i) => {
            const resolved = resolveRef(ref);
            const label = resolved?.title || resolved?.full_key || `item-${i}`;
            return (
              <dd
                key={resolved?.gid || i}
                id={withIds && slugify
                  ? `addprop-${slugify(label)}`
                  : undefined}
              >
                <RefItem
                  docRef={ref}
                  currentUrl={currentUrl}
                  useKey={false}
                  keyOverride={undefined}
                  helpers={helpers}
                />
              </dd>
            );
          })}
        </>
      )}
    </>
  );
}

function ArrayItems(
  { entry, currentUrl, helpers, withIds, slugify }: PropertiesTableProps,
) {
  const items = entry.items || [];
  if (items.length === 0) return null;

  return (
    <>
      <dt id={withIds ? "items" : undefined}>Items:</dt>
      {items.map((ref, i) => {
        const resolved = resolveRef(ref);
        const label = getDisplayName(resolved) || `item-${i}`;
        return (
          <dd
            key={resolved?.gid || i}
            id={withIds && slugify ? `item-${slugify(label)}` : undefined}
          >
            <RefItem
              docRef={ref}
              currentUrl={currentUrl}
              useKey={false}
              keyOverride={undefined}
              helpers={helpers}
            />
          </dd>
        );
      })}
      {entry.uniqueItems && (
        <dd>
          <p>All items must be unique.</p>
        </dd>
      )}
    </>
  );
}

function AnyOfTypes(
  { entry, currentUrl, helpers, withIds, slugify }: PropertiesTableProps,
) {
  const anyOf = entry.anyOf || [];
  if (anyOf.length === 0) return null;

  return (
    <>
      <dt id={withIds ? "types" : undefined}>Types:</dt>
      {anyOf.map((ref, i) => {
        const resolved = resolveRef(ref);
        const label = getDisplayName(resolved) || `type-${i}`;
        return (
          <dd
            key={resolved?.gid || i}
            id={withIds && slugify ? `type-${slugify(label)}` : undefined}
          >
            <RefItem
              docRef={ref}
              currentUrl={currentUrl}
              useKey={false}
              keyOverride={undefined}
              helpers={helpers}
            />
          </dd>
        );
      })}
    </>
  );
}

export default function PropertiesTable(
  { entry, currentUrl, helpers, withIds = false, slugify }:
    PropertiesTableProps,
) {
  if (!entry) return null;

  const props = { entry, currentUrl, helpers, withIds, slugify };

  if (entry.type === "object") {
    return <ObjectProperties {...props} />;
  }

  if (entry.type === "array" && entry.items?.length) {
    return <ArrayItems {...props} />;
  }

  if (entry.anyOf?.length) {
    return <AnyOfTypes {...props} />;
  }

  return null;
}

export { AnyOfTypes, ArrayItems, ObjectProperties };
