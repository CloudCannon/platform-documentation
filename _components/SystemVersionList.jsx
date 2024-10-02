export default function ({comp, language, item, showdefault, systemversions}) {
  const lookup = systemversions?.[language]?.[item];
  return (
      <ul>
          {lookup?.list?.map((tab) => {
            return <li key={tab}><code>{tab}</code> {showdefault && tab === lookup.default ? '(default)' : ''}</li>
          })}
      </ul>
  );
}