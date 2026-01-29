import { getDisplayName, getRefUrl, resolveRef } from './helpers.ts';
import RefType from './RefType.tsx';
import MultiCodeBlock from '../MultiCodeBlock.tsx';
import Annotation from '../Annotation.tsx';
import type { DocEntry, Helpers } from '../../_types.d.ts';

const MAX_ENUM_VALUES = 10;

interface RefSummaryProps {
    entry: DocEntry;
    helpers?: Helpers;
}

function RefSummary({ entry, helpers }: RefSummaryProps) {
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
                {examples.filter(example => example.code).map((example, i) => (
                    <div key={i}>
                        {example.description && helpers && (
                            <div dangerouslySetInnerHTML={{ __html: helpers.md(example.description) }} />
                        )}
                        {example.description && !helpers && (
                            <div>{example.description}</div>
                        )}
                        <MultiCodeBlock 
                            language={example.language || 'yaml'} 
                            source={example.source || 'cloudcannon.config.yml'}
                            translate_into={(!example.language || example.language === 'yaml') ? ['json'] : []}
                        >
                            <pre><code className={`language-${example.language || 'yaml'}`}>
                                {example.code}
                            </code></pre>
                        {example.annotations?.map((annotation, j) => (
                            <Annotation key={j} number={annotation.number || 0}>
                                {annotation.content}
                            </Annotation>
                        ))}
                        </MultiCodeBlock>
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

interface RefItemProps {
    docRef: DocEntry | null | undefined;
    currentUrl?: string;
    useKey?: boolean;
    keyOverride?: string;
    helpers?: Helpers;
}

export default function RefItem({ docRef, currentUrl, useKey = true, keyOverride, helpers }: RefItemProps) {
    const doc = resolveRef(docRef);
    if (!doc) return null;
    
    const url = getRefUrl(doc);
    const displayName = getDisplayName(doc);
    const label = keyOverride || (useKey ? doc.key : displayName);
    
    return (
        <article className="bordered">
            <div>
                <span class="code">
                    {url ? (
                        useKey 
                            ? <strong><a href={url}>{label}</a></strong>
                            : <em><a href={url}>{label}</a></em>
                    ) : (
                        useKey 
                            ? <strong>{label}</strong>
                            : <em>{label}</em>
                    )}
                </span>
                {' '}
                <RefType doc={doc} currentUrl={currentUrl} />
            </div>
            <RefSummary entry={doc} helpers={helpers} />
        </article>
    );
}

export { RefSummary };
