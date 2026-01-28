import { resolveRef } from './helpers.js';
import RefItem from './RefItem.jsx';

function ObjectProperties({ entry, currentUrl, helpers }) {
    const properties = Object.entries(entry.properties || {});
    const additionalProps = entry.additionalProperties || [];
    
    return (
        <>
            <dt>Properties:</dt>
            {properties.length > 0 ? (
                properties.map(([key, ref]) => (
                    <dd key={key}>
                        <RefItem 
                            docRef={ref} 
                            currentUrl={currentUrl} 
                            useKey={true}
                            keyOverride={key}
                            helpers={helpers} 
                        />
                    </dd>
                ))
            ) : (
                <dd><p>There are no reserved properties.</p></dd>
            )}
            
            {additionalProps.length > 0 && (
                <>
                    <dt>Additional properties:</dt>
                    {additionalProps.map((ref, i) => {
                        const resolved = resolveRef(ref);
                        return (
                            <dd key={resolved?.gid || i}>
                                <RefItem 
                                    docRef={ref} 
                                    currentUrl={currentUrl} 
                                    useKey={false}
                                    helpers={helpers} 
                                />
                            </dd>
                        );
                    })}
                </>
            )}
        </>
    );
}

function ArrayItems({ entry, currentUrl, helpers }) {
    const items = entry.items || [];
    if (items.length === 0) return null;
    
    return (
        <>
            <dt>Items:</dt>
            {items.map((ref, i) => {
                const resolved = resolveRef(ref);
                return (
                    <dd key={resolved?.gid || i}>
                        <RefItem 
                            docRef={ref} 
                            currentUrl={currentUrl} 
                            useKey={false}
                            helpers={helpers} 
                        />
                    </dd>
                );
            })}
            {entry.uniqueItems && (
                <dd><p>All items must be unique.</p></dd>
            )}
        </>
    );
}

function AnyOfTypes({ entry, currentUrl, helpers }) {
    const anyOf = entry.anyOf || [];
    if (anyOf.length === 0) return null;
    
    return (
        <>
            <dt>Types:</dt>
            {anyOf.map((ref, i) => {
                const resolved = resolveRef(ref);
                return (
                    <dd key={resolved?.gid || i}>
                        <RefItem 
                            docRef={ref} 
                            currentUrl={currentUrl} 
                            useKey={false}
                            helpers={helpers} 
                        />
                    </dd>
                );
            })}
        </>
    );
}

export default function RefList({ entry, currentUrl, helpers }) {
    if (!entry) return null;
    
    if (entry.type === 'object') {
        return <ObjectProperties entry={entry} currentUrl={currentUrl} helpers={helpers} />;
    }
    
    if (entry.type === 'array' && entry.items?.length) {
        return <ArrayItems entry={entry} currentUrl={currentUrl} helpers={helpers} />;
    }
    
    if (entry.anyOf?.length) {
        return <AnyOfTypes entry={entry} currentUrl={currentUrl} helpers={helpers} />;
    }
    
    return null;
}

export { ObjectProperties, ArrayItems, AnyOfTypes };
