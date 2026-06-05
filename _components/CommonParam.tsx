interface CommonParamProps {
  parameter: string;
  parameters: Record<string, unknown>;
  append?: string;
  prepend?: string;
}

export default function CommonParam(
  { parameter, parameters, append = "", prepend = "" }: CommonParamProps,
) {
  return (
    <>
      {parameters[parameter]
        ? `${prepend}${parameters[parameter]}${append}`
        : ""}
    </>
  );
}

export function toMarkdown(
  { parameter, parameters, append = "", prepend = "" }: CommonParamProps,
): string {
  const value = parameters[parameter];
  return value ? `${prepend}${value}${append}` : "";
}
