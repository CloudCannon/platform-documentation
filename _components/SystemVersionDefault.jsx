export default function ({comp, language, item, systemversions, plaintext = false}) {
  const lookup = systemversions?.[language]?.[item];
  return (plaintext ? <span>{lookup.default || 'Unknown'}</span> : <code>{lookup.default || 'Unknown'}</code>);
}