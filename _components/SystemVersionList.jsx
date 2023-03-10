export default function ({comp, language, item, systemversions}) {
  const lookup = systemversions?.[language]?.[item];
  return (
      <ul>
          {lookup?.list?.map((tab) => {
            return <li key={tab}><code>{tab}</code> {tab === lookup.default ? '(default)' : ''}</li>
          })}
      </ul>
  );
}