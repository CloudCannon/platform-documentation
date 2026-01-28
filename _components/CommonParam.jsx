export default function ({parameter, parameters, append = "", prepend = ""}) {
  return (
      <>
        {parameters[parameter] ? `${prepend}${parameters[parameter]}${append}` : ""}
      </>
  );
}
