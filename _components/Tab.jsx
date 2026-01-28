export default function ({name, children}) {
    return (
        <div className="c-tab" 
            x-data={`{
                tabName: '${ name }'
            }`}
            x-show="selectedTab === tabName">
            {children}
        </div>
    );
}

