export default function ({language, item, systemversions}) {
  const lookup = systemversions?.[language]?.[item];
  return (<code>{lookup.default || 'Unknown'}</code>);
}