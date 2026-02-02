interface TabProps {
  name: string;
  children: unknown;
}

export default function Tab({ name, children }: TabProps) {
  return (
    <div
      className="c-tab"
      x-data={`{
                tabName: '${name}'
            }`}
      x-show="selectedTab === tabName"
    >
      {children}
    </div>
  );
}
