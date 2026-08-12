import type { DocEntry } from "../../_types.d.ts";

export default function DocNameFull(
  { doc }: { doc?: DocEntry },
): JSX.Component | string | undefined {
  if (!doc) return undefined;
  if (doc.title) return doc.title;
  // Split a snake_case key so each underscore gets a <wbr> after it — long keys
  // like `_snippets_definitions_from_glob` will then wrap on the last underscore
  // that fits, instead of breaking mid-word.
  const key = doc.key ?? "";
  const segments = key.split("_");
  return (
    <code>
      {segments.flatMap((seg, i) =>
        i === 0 ? [seg] : ["_", <wbr key={`w-${i}`} />, seg]
      )}
    </code>
  );
}
