import { getDisplayName, getRefUrl, resolveRef } from './helpers.js';
import TypeDisplay from './TypeDisplay.jsx';

const MAX_ENUM_VALUES = 10;

function RefSummary({ entry, helpers }) {
    const examples = entry.documentation?.examples || [];
    const enumValues = entry.enum || [];
    const displayEnumCount = Math.min(enumValues.length, MAX_ENUM_VALUES);
    const enumMore = enumValues.length - displayEnumCount;
    
    return (
        <>
            {entry.description && helpers && (
                <div dangerouslySetInnerHTML={{ __html: helpers.md(entry.description) }} />
            )}
            {entry.description && !helpers && (
                <div>{entry.description}</div>
            )}
            
            <details className={!examples.length ? 'show-in-cms' : undefined}>
                <summary><em>Examples</em></summary>
                {examples.map((example, i) => (
                    <div key={i}>
                        {example.description && helpers && (
                            <div dangerouslySetInnerHTML={{ __html: helpers.md(example.description) }} />
                        )}
                        {example.description && !helpers && (
                            <div>{example.description}</div>
                        )}
                        <pre>
                            <code className={`language-${example.language || 'yaml'}`}>
                                {example.code}
                            </code>
                        </pre>
                    </div>
                ))}
            </details>
            
            {entry.default !== undefined && (
                <p><em>Defaults to:</em> <code>{String(entry.default)}</code></p>
            )}
            
            {displayEnumCount > 0 && (
                <p>
                    <em>Allowed values:</em>{' '}
                    {enumValues.slice(0, displayEnumCount).map((val, i) => (
                        <span key={i}>
                            {i > 0 && ' '}
                            <code>{val}</code>
                        </span>
                    ))}
                    {enumMore > 0 && ` and ${enumMore} more.`}
                </p>
            )}
        </>
    );
}

export default function RefItem({ docRef, currentUrl, useKey = true, keyOverride, helpers }) {
    const doc = resolveRef(docRef);
    if (!doc) return null;
    
    const url = getRefUrl(doc);
    const displayName = getDisplayName(doc);
    const label = keyOverride || (useKey ? doc.key : displayName);
    
    return (
        <article className="bordered">
            <div>
                {url ? (
                    useKey 
                        ? <strong><a href={url}>{label}</a></strong>
                        : <em><a href={url}>{label}</a></em>
                ) : (
                    useKey 
                        ? <strong>{label}</strong>
                        : <em>{label}</em>
                )}
                {' – '}
                <code>
                    <TypeDisplay entry={doc} currentUrl={currentUrl} />
                </code>
                {doc.required && (
                    <small style={{ color: 'red' }}> (Required)</small>
                )}
            </div>
            <RefSummary entry={doc} helpers={helpers} />
        </article>
    );
}

export { RefSummary };
