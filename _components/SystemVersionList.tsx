interface SystemVersionListProps {
    language: string;
    item: string;
    showdefault?: boolean;
    systemversions: Record<string, Record<string, { default?: string; list?: string[] }>>;
}

export default function SystemVersionList({ language, item, showdefault, systemversions }: SystemVersionListProps) {
  const lookup = systemversions?.[language]?.[item];
  return (
      <ul>
          {lookup?.list?.map((tab) => {
            return <li key={tab}><code>{tab}</code> {showdefault && tab === lookup.default ? '(default)' : ''}</li>
          })}
      </ul>
  );
}
