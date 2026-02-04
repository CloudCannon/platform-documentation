import {
  getDisplayName,
  getShortKey,
  resolveRef,
  type SectionId,
} from "./helpers.ts";
import RefItem from "./RefItem.tsx";
import type { DocEntry, Helpers } from "../../_types.d.ts";

interface PropertiesTableProps {
  entry: DocEntry;
  currentUrl?: string;
  section: SectionId;
  helpers?: Helpers;
  withIds?: boolean;
  slugify?: (str: string) => string;
}

function ObjectProperties(
  { entry, currentUrl, section, helpers, withIds, slugify }:
    PropertiesTableProps,
) {
  const properties = Object.entries(entry.properties || {})
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  const additionalProps = entry.additionalProperties || [];
  let additionalValues: DocEntry[] = [];

  if (additionalProps.length === 1) {
    const resolved = resolveRef(additionalProps[0], section);
    if (resolved?.anyOf?.length) {
      additionalValues = resolved.anyOf;
    }
  }

  return (
    <>
      {properties.length > 0 && (
        <>
          <dt id={withIds ? "properties" : undefined}>Properties:</dt>
          <dd class="c-data-reference">
            {properties.map(([key, ref]) => (
              <div
                class="c-data-reference__item"
                key={key}
                id={withIds && slugify
                  ? `prop-${slugify(getShortKey(key))}`
                  : undefined}
              >
                <RefItem
                  docRef={ref}
                  currentUrl={currentUrl}
                  section={section}
                  useKey
                  keyOverride={getShortKey(key)}
                  helpers={helpers}
                />
              </div>
            ))}
          </dd>
        </>
      )}

      {additionalValues.length > 0 && (
        <>
          <dt id={withIds ? "additional-values" : undefined}>Values:</dt>
          <dd class="c-data-reference">
            {additionalValues.map((ref, i) => {
              const resolved = resolveRef(ref, section);
              const label = resolved?.title || resolved?.full_key ||
                `item-${i}`;
              return (
                <div
                  class="c-data-reference__item"
                  key={resolved?.gid || i}
                  id={withIds && slugify
                    ? `addvalue-${slugify(label)}`
                    : undefined}
                >
                  <RefItem
                    docRef={ref}
                    currentUrl={currentUrl}
                    section={section}
                    useKey={false}
                    keyOverride={undefined}
                    helpers={helpers}
                  />
                </div>
              );
            })}
          </dd>
        </>
      )}

      {!additionalValues.length && additionalProps.length > 0 && (
        <>
          <dt id={withIds ? "additional-properties" : undefined}>Values:</dt>
          <dd class="c-data-reference">
            {additionalProps.map((ref, i) => {
              const resolved = resolveRef(ref, section);
              const label = resolved?.title || resolved?.full_key ||
                `item-${i}`;
              return (
                <div
                  class="c-data-reference__item"
                  key={resolved?.gid || i}
                  id={withIds && slugify
                    ? `addprop-${slugify(label)}`
                    : undefined}
                >
                  <RefItem
                    docRef={ref}
                    currentUrl={currentUrl}
                    section={section}
                    useKey={false}
                    keyOverride={undefined}
                    helpers={helpers}
                  />
                </div>
              );
            })}
          </dd>
        </>
      )}
    </>
  );
}

function ArrayItems(
  { entry, currentUrl, section, helpers, withIds, slugify }:
    PropertiesTableProps,
) {
  const items = entry.items || [];
  if (items.length === 0) return null;

  return (
    <>
      <dt id={withIds ? "items" : undefined}>Items:</dt>
      <dd class="c-data-reference">
        {items.map((ref, i) => {
          const resolved = resolveRef(ref, section);
          const label = getDisplayName(resolved) || `item-${i}`;
          return (
            <div
              class="c-data-reference__item"
              key={resolved?.gid || i}
              id={withIds && slugify ? `item-${slugify(label)}` : undefined}
            >
              <RefItem
                docRef={ref}
                currentUrl={currentUrl}
                section={section}
                useKey
                keyOverride={undefined}
                helpers={helpers}
              />
            </div>
          );
        })}
      </dd>

      {entry.uniqueItems && (
        <dd>
          <p>All items must be unique.</p>
        </dd>
      )}
    </>
  );
}

function AnyOfTypes(
  { entry, currentUrl, section, helpers, withIds, slugify }:
    PropertiesTableProps,
) {
  const anyOf = entry.anyOf || [];
  if (anyOf.length === 0) return null;

  return (
    <>
      <dt id={withIds ? "types" : undefined}>Types:</dt>
      <dd class="c-data-reference">
        {anyOf.map((ref, i) => {
          const resolved = resolveRef(ref, section);
          const label = getDisplayName(resolved) || `type-${i}`;
          return (
            <div
              class="c-data-reference__item"
              key={resolved?.gid || i}
              id={withIds && slugify ? `type-${slugify(label)}` : undefined}
            >
              <RefItem
                docRef={ref}
                currentUrl={currentUrl}
                section={section}
                useKey={false}
                keyOverride={undefined}
                helpers={helpers}
              />
            </div>
          );
        })}
      </dd>
    </>
  );
}

export default function PropertiesTable(
  { entry, currentUrl, section, helpers, withIds = false, slugify }:
    PropertiesTableProps,
) {
  if (!entry) return null;

  const props = { entry, currentUrl, section, helpers, withIds, slugify };
  const hasProperties = entry.properties &&
    Object.keys(entry.properties).length > 0;

  // Show properties for objects OR any entry type that has properties defined
  // (e.g., "array of objects" types where children define the item schema)
  if (entry.type === "object" || hasProperties) {
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
