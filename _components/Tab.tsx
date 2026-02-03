interface TabProps {
  name: string;
  children: unknown;
}

export default function Tab({ name, children }: TabProps) {
  return (
    <div
      className="c-code-block__panel"
      role="tabpanel"
      x-data={`{ tabName: '${name}' }`}
      x-show="selectedTab === tabName"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
