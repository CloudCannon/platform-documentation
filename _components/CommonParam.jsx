export default function ({comp, parameter, parameters, append = "", prepend = ""}) {
  return (
      <>
        {parameters[parameter] ? `${prepend}${parameters[parameter]}${append}` : ""}
      </>
  );
}
