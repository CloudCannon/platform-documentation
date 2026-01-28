import { getDisplayName, getRefUrl, resolveRef } from './helpers.js';

export default function TypeDisplay({ entry, currentUrl, nested = false }) {
    if (!entry) return 'unknown';

    if (nested && entry.url && (entry.title || entry.key)) {
        return <a href={getRefUrl(entry)}>{getDisplayName(entry)}</a>;
    }

    if (entry.type === 'array') {
        const items = entry.items?.map(ref => resolveRef(ref)) || [];
        const shouldLink = nested && entry.url && currentUrl !== entry.url;
        
        return (
            <>
                {shouldLink ? <a href={getRefUrl(entry)}>Array</a> : 'Array'}
                {items.length > 0 && (
                    <>
                        <span style={{ opacity: 0.5 }}>&lt;</span>
                        {items.map((item, i) => (
                            <span key={item?.gid || i}>
                                {i > 0 && ' | '}
                                <TypeDisplay entry={item} currentUrl={currentUrl} nested />
                            </span>
                        ))}
                        <span style={{ opacity: 0.5 }}>&gt;</span>
                    </>
                )}
            </>
        );
    }

    if (entry.type === 'object') {
        const additionalProps = entry.additionalProperties || [];
        const shouldLink = nested && entry.url && currentUrl !== entry.url;
        
        return (
            <>
                {shouldLink ? <a href={getRefUrl(entry)}>Object</a> : 'Object'}
                {additionalProps.length === 1 && (
                    <>
                        <span style={{ opacity: 0.5 }}>&lt;</span>
                        <TypeDisplay 
                            entry={resolveRef(additionalProps[0])} 
                            currentUrl={currentUrl} 
                            nested 
                        />
                        <span style={{ opacity: 0.5 }}>&gt;</span>
                    </>
                )}
            </>
        );
    }

    if (entry.type === 'string') {
        const display = entry.const ? `"${entry.const}"` : 'string';
        const shouldLink = nested && entry.url && currentUrl !== entry.url;
        return shouldLink ? <a href={getRefUrl(entry)}>{display}</a> : display;
    }

    if (entry.type === 'number' || entry.type === 'integer') {
        const hasConst = entry.const !== undefined;
        const display = hasConst ? String(entry.const) : entry.type;
        const shouldLink = nested && entry.url && currentUrl !== entry.url;
        return shouldLink ? <a href={getRefUrl(entry)}>{display}</a> : display;
    }

    if (entry.type === 'boolean') {
        const hasConst = entry.const !== undefined;
        const display = hasConst ? String(entry.const) : 'boolean';
        const shouldLink = nested && entry.url && currentUrl !== entry.url;
        return shouldLink ? <a href={getRefUrl(entry)}>{display}</a> : display;
    }

    if (entry.anyOf?.length) {
        return (
            <>
                {entry.anyOf.map((ref, i) => (
                    <span key={resolveRef(ref)?.gid || i}>
                        {i > 0 && ' | '}
                        <TypeDisplay entry={resolveRef(ref)} currentUrl={currentUrl} nested />
                    </span>
                ))}
            </>
        );
    }

    const fallback = entry.type || getDisplayName(entry) || 'unknown';
    const shouldLink = nested && entry.url && currentUrl !== entry.url;
    return shouldLink ? <a href={getRefUrl(entry)}>{fallback}</a> : fallback;
}
