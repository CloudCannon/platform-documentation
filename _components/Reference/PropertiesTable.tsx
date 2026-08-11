import {
  getDisplayName,
  getShortKey,
  resolveRef,
  type SectionId,
} from "./helpers.ts";
import type { Comp, DocEntry, Helpers } from "../../_types.d.ts";

interface PropertiesTableProps {
  entry: DocEntry;
  currentUrl?: string;
  section: SectionId;
  helpers?: Helpers;
  withIds?: boolean;
  slugify?: (str: string) => string;
  comp: Comp;
}

interface RefListProps extends Omit<PropertiesTableProps, "entry"> {
  refs: DocEntry[];
  idPrefix: string;
  useKey: "auto" | boolean;
  getLabel: (resolved: DocEntry | null, index: number) => string;
}

function RefList(
  {
    comp,
    refs,
    idPrefix,
    useKey,
    getLabel,
    currentUrl,
    section,
    helpers,
    withIds,
    slugify,
  }: RefListProps,
) {
  return (
    <div class="c-data-reference">
      {refs.map((ref, i) => {
        const resolved = resolveRef(ref, section);
        return (
          <comp.Reference.RefItem
            key={resolved?.gid || i}
            id={withIds && slugify
              ? `${idPrefix}-${slugify(getLabel(resolved, i))}`
              : undefined}
            docRef={ref}
            currentUrl={currentUrl}
            section={section}
            useKey={useKey === "auto" ? !resolved?.title : useKey}
            keyOverride={!resolved?.title && resolved?.key
              ? getShortKey(resolved.key)
              : undefined}
            helpers={helpers}
          />
        );
      })}
    </div>
  );
}

function ObjectProperties(
  { comp, entry, currentUrl, section, helpers, withIds, slugify }:
    PropertiesTableProps,
) {
  // The Visual Editor API reference follows declaration order from the source
  // .d.ts (so get/set lead before the event listeners, matching how the API
  // reads). Every other section sorts members alphabetically.
  const properties = Object.entries(entry.properties || {});
  if (section !== "type.VisualEditorAPI") {
    properties.sort(([keyA], [keyB]) =>
      keyA.replace(/^_+/, "").localeCompare(keyB.replace(/^_+/, ""))
    );
  }
  const additionalProps = entry.additionalProperties || [];
  let additionalValues: DocEntry[] = [];

  if (additionalProps.length === 1) {
    const resolved = resolveRef(additionalProps[0], section);
    if (resolved?.anyOf?.length) {
      additionalValues = resolved.anyOf;
    }
  }

  const shared = { comp, currentUrl, section, helpers, withIds, slugify };
  const getAdditionalLabel = (resolved: DocEntry | null, i: number) =>
    resolved?.title || resolved?.full_key || `item-${i}`;

  return (
    <>
      {properties.length > 0 && (
        <>
          <h2 class="exclude-from-toc" id={withIds ? "properties" : undefined}>
            Properties
          </h2>
          <div class="c-data-reference">
            {properties.map(([key, ref]) => (
              <comp.Reference.RefItem
                key={key}
                id={withIds && slugify
                  ? `prop-${slugify(getShortKey(key))}`
                  : undefined}
                docRef={ref}
                currentUrl={currentUrl}
                section={section}
                keyOverride={getShortKey(key)}
                helpers={helpers}
              />
            ))}
          </div>
        </>
      )}

      {additionalValues.length > 0 && (
        <>
          <h2
            class="exclude-from-toc"
            id={withIds ? "additional-values" : undefined}
          >
            Values
          </h2>
          <RefList
            refs={additionalValues}
            idPrefix="addvalue"
            useKey="auto"
            getLabel={getAdditionalLabel}
            {...shared}
          />
        </>
      )}

      {!additionalValues.length && additionalProps.length > 0 && (
        <>
          <h2
            class="exclude-from-toc"
            id={withIds ? "additional-properties" : undefined}
          >
            Values
          </h2>
          <RefList
            refs={additionalProps}
            idPrefix="addprop"
            useKey="auto"
            getLabel={getAdditionalLabel}
            {...shared}
          />
        </>
      )}
    </>
  );
}

function ArrayItems(
  { comp, entry, currentUrl, section, helpers, withIds, slugify }:
    PropertiesTableProps,
) {
  const items = entry.items || [];
  if (items.length === 0) return null;

  return (
    <>
      <h2 class="exclude-from-toc" id={withIds ? "items" : undefined}>Items</h2>
      <RefList
        comp={comp}
        currentUrl={currentUrl}
        section={section}
        helpers={helpers}
        withIds={withIds}
        slugify={slugify}
        refs={items}
        idPrefix="item"
        useKey
        getLabel={(resolved, i) => getDisplayName(resolved) || `item-${i}`}
      />

      {entry.uniqueItems && <p>All items must be unique.</p>}
    </>
  );
}

function AnyOfTypes(
  { comp, entry, currentUrl, section, helpers, withIds, slugify }:
    PropertiesTableProps,
) {
  const anyOf = entry.anyOf || [];
  if (anyOf.length === 0) return null;

  return (
    <>
      <h2 class="exclude-from-toc" id={withIds ? "types" : undefined}>Types</h2>
      <RefList
        comp={comp}
        currentUrl={currentUrl}
        section={section}
        helpers={helpers}
        withIds={withIds}
        slugify={slugify}
        refs={anyOf}
        idPrefix="type"
        useKey={false}
        getLabel={(resolved, i) => getDisplayName(resolved) || `type-${i}`}
      />
    </>
  );
}

export default function PropertiesTable(props: PropertiesTableProps) {
  // Show properties for objects OR any entry type that has properties defined
  // (e.g., "array of objects" types where children define the item schema)
  if (
    props.entry?.type === "object" ||
    (props.entry?.properties && Object.keys(props.entry?.properties).length > 0)
  ) {
    return <ObjectProperties {...props} />;
  }

  if (props.entry?.type === "array" && props.entry?.items?.length) {
    return <ArrayItems {...props} />;
  }

  if (props.entry?.anyOf?.length) {
    return <AnyOfTypes {...props} />;
  }

  return null;
}
