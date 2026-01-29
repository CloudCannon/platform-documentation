interface SystemVersionDefaultProps {
    language: string;
    item: string;
    systemversions: Record<string, Record<string, { default?: string }>>;
}

export default function SystemVersionDefault({ language, item, systemversions }: SystemVersionDefaultProps) {
  const lookup = systemversions?.[language]?.[item];
  return (<code>{lookup?.default || 'Unknown'}</code>);
}
