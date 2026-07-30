import type { DocEntry } from "../../_types.d.ts";

// Split a snake_case key so each underscore gets a <wbr> after it — long keys
// like `_snippets_definitions_from_glob` will then wrap on the last underscore
// that fits, instead of breaking mid-word.
function keyWithBreaks(key: string): JSX.Element {
  const segments = key.split("_");
  const nodes: (string | JSX.Element)[] = [];
  segments.forEach((seg, i) => {
    if (i > 0) {
      nodes.push("_");
      nodes.push(<wbr key={`w-${i}`} />);
    }
    if (seg) nodes.push(seg);
  });
  return <>{nodes}</>;
}

export default function DocNameFull(
  { doc }: { doc?: DocEntry },
): JSX.Component | string | undefined {
  if (doc) {
    return doc.title ? doc.title : <code>{keyWithBreaks(doc.key)}</code>;
  }
}
