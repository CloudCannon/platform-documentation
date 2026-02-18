import type { Helpers } from "../_types.d.ts";

interface CommonContentProps {
  comp: string;
  data: {
    _file: string;
    [key: string]: unknown;
  };
  children: unknown;
}

export default function CommonContent(
  { comp, data, children }: CommonContentProps,
  helpers: Helpers,
) {
  const content_id = helpers.render_common(data._file, {
    comp,
    parameters: data,
  });
  return (
    <div data-common-content-id={content_id}>
      -- REUSABLE_CONTENT_STUB --
      {children}
      -- REUSABLE_CONTENT_STUB --
    </div>
  );
}

export function toMarkdown(
  _props: CommonContentProps,
  childrenMd: string,
): string {
  return childrenMd;
}
