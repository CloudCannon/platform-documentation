export default function ({comp, parameter, parameters}) {
  return (
      <>
        {parameters[parameter] || ""}
      </>
  );
}
