import type { DocEntry } from "../../_types.d.ts";

export default function DocNameFull(
  { doc }: { doc?: DocEntry },
): JSX.Component | string | undefined {
  if (doc) {
    return doc.title ? doc.title : <code>{doc.key}</code>;
  }
}
