import { 
    getDisplayName, 
    getRefUrl, 
    getBreadcrumbChain, 
    getDocByGid,
    resolveRef,
    isGidInside,
    BASE_URL 
} from '../../_components/Reference/helpers.js';
import { parseDocUrl, slugify } from '../../_components/utils/index.js';
import MobileTOC from '../../_components/Layout/MobileTOC.jsx';
import NavSidebar from '../../_components/Layout/NavSidebar.jsx';

import TypeDisplay from '../../_components/Reference/TypeDisplay.jsx';
import RefItem from '../../_components/Reference/RefItem.jsx';
import RefList from '../../_components/Reference/RefList.jsx';
import DocNav from '../../_components/Reference/DocNav.jsx';
import MultiCodeBlock from '../../_components/MultiCodeBlock.jsx';
import Annotation from '../../_components/Annotation.jsx';

function Breadcrumbs({ entry, parent, appearsIn, helpers }) {
    const totalAppearsIn = (parent ? 1 : 0) + appearsIn.length;
    if (totalAppearsIn !== 1) return null;
    
    const singleParent = parent || getDocByGid(appearsIn[0]);
    const breadcrumbChain = getBreadcrumbChain(singleParent);
    
    return (
        <>
            {breadcrumbChain.map((crumb, i) => (
                <span key={crumb.gid || i}>
                    <img src={helpers.icon('arrow_forward_ios:outlined', 'material')} inline="true" />
                    {crumb.url === '/' ? (
                        <span>Configuration File</span>
                    ) : (
                        <a href={getRefUrl(crumb)}>{getDisplayName(crumb)}</a>
                    )}
                </span>
            ))}
        </>
    );
}


function getTocItems(entry) {
    const items = [];
    
    if (entry.type === 'object') {
        const properties = Object.keys(entry.properties || {});
        const additionalProps = entry.additionalProperties || [];
        
        properties.forEach(key => {
            items.push({ id: `prop-${slugify(key)}`, label: key });
        });
        
        additionalProps.forEach((ref, i) => {
            const resolved = resolveRef(ref);
            const label = getDisplayName(resolved) || `item-${i}`;
            items.push({ id: `addprop-${slugify(label)}`, label });
        });
    } else if (entry.type === 'array' && entry.items?.length) {
        entry.items.forEach((ref, i) => {
            const resolved = resolveRef(ref);
            const label = getDisplayName(resolved) || `item-${i}`;
            items.push({ id: `item-${slugify(label)}`, label });
        });
    } else if (entry.anyOf?.length) {
        entry.anyOf.forEach((ref, i) => {
            const resolved = resolveRef(ref);
            const label = getDisplayName(resolved) || `type-${i}`;
            items.push({ id: `type-${slugify(label)}`, label });
        });
    }
    
    return items;
}

function TableOfContents({ items, withHeading = false }) {
    if (items.length === 0) return null;
    
    return (
        <>
            {withHeading && <h3 className="l-toc__heading">Table of contents</h3>}
            <ol className="l-toc__list" x-data="">
                {items.map(item => (
                    <li key={item.id} x-bind:class={`visibleHeadingId === '${item.id}' ? 'active' : ''`}>
                        <a href={`#${item.id}`}>{item.label}</a>
                    </li>
                ))}
            </ol>
        </>
    );
}

export default function AutomatedReferenceLayout({ entry, page, navigation, full_docs, url, search }, helpers) {
    if (!entry) {
        return <div>Error: No entry provided</div>;
    }
    
    const displayName = getDisplayName(entry);
    const parent = entry.parent ? getDocByGid(entry.parent) : null;
    const appearsIn = entry.appears_in || [];
    const totalAppearsIn = (parent ? 1 : 0) + appearsIn.length;
    const currentUrl = page?.data?.url || url || '';
    const examples = (entry.documentation?.examples || []).filter(ex => ex.code);
    
    const { navKey: sectionKey } = parseDocUrl(currentUrl);
    const navData = navigation?.[sectionKey];
    
    const tocItems = getTocItems(entry);
    
    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <NavSidebar className="developer-reference">
                    <DocNav 
                        navigation={navData}
                        currentDoc={entry}
                        currentUrl={currentUrl}
                        items={full_docs}
                        page={page}
                        search={search}
                        helpers={helpers}
                    />
                </NavSidebar>
                
                <div className="u-card-box l-content" x-data="$visibleNavHighlighter">
                    <div className="l-breadcrumb">
                        <a href="/documentation/developer-reference/" style="text-transform: capitalize;">Developer Reference</a>
                        <Breadcrumbs 
                            entry={entry} 
                            parent={parent} 
                            appearsIn={appearsIn}
                            helpers={helpers}
                        />
                    </div>
                    
                    <h1 data-pagefind-body className="l-heading u-margin-bottom-0">
                        {displayName}
                    </h1>
                    
                    <MobileTOC helpers={helpers} listClassName="">
                        <TableOfContents items={tocItems} />
                    </MobileTOC>
                    
                    <div 
                        data-pagefind-body 
                        data-pagefind-filter="site:Documentation" 
                        data-pagefind-meta="site:Documentation" 
                        className="l-content-split"
                    >
                        <main>
                            <dl>
                                {entry.full_key !== entry.key && (
                                    <>
                                        <dt id="full-key">Full key:</dt>
                                        <dd><code>{entry.full_key}</code></dd>
                                    </>
                                )}
                                
                                <dt id="description" className={!entry.description ? 'show-in-cms' : undefined}>
                                    Description:
                                </dt>
                                <dd>
                                    {entry.description && (
                                        <span dangerouslySetInnerHTML={{ __html: helpers.md(entry.description) }} />
                                    )}
                                </dd>
                                
                                {!entry.anyOf?.length && (
                                    <>
                                        <dt id="type">Type:</dt>
                                        <dd>
                                            <code>
                                                <TypeDisplay entry={entry} currentUrl={currentUrl} />
                                            </code>
                                            {entry.required && (
                                                <small style={{ color: 'red' }}> (Required)</small>
                                            )}
                                        </dd>
                                    </>
                                )}
                                
                                {totalAppearsIn > 1 && (
                                    <>
                                        <dt id="appears-in">Appears in:</dt>
                                        {parent && (
                                            <dd>
                                                {parent.url === '/' ? 'Configuration File' : (
                                                    <a href={getRefUrl(parent)}>
                                                        <code>{parent.full_key}</code>
                                                    </a>
                                                )}
                                            </dd>
                                        )}
                                        {appearsIn.map(gid => {
                                            const doc = getDocByGid(gid);
                                            if (!doc) return null;
                                            return (
                                                <dd key={gid}>
                                                    {doc.url === '/' ? 'Configuration File' : (
                                                        <a href={getRefUrl(doc)}>
                                                            <code>{doc.full_key}</code>
                                                        </a>
                                                    )}
                                                </dd>
                                            );
                                        })}
                                    </>
                                )}
                                
                                {entry.default !== undefined && (
                                    <>
                                        <dt id="default-value">Default value:</dt>
                                        <dd><code>{String(entry.default)}</code></dd>
                                    </>
                                )}
                                
                                {entry.enum?.length > 0 && (
                                    <>
                                        <dt id="allowed-values">Allowed values:</dt>
                                        {entry.enum.map((val, i) => (
                                            <dd key={i}><code>{val}</code></dd>
                                        ))}
                                    </>
                                )}

                                <RefListWithIds entry={entry} currentUrl={currentUrl} helpers={helpers} />
                                
                                <dt id="examples" className={!examples.length ? 'show-in-cms' : undefined}>
                                    Examples:
                                </dt>
                                {examples.map((example, i) => (
                                    <dd key={i}>
                                        {example.description && (
                                            <div dangerouslySetInnerHTML={{ __html: helpers.md(example.description) }} />
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
                                                <Annotation key={j} number={annotation.number}>
                                                    {annotation.content}
                                                </Annotation>
                                            ))}
                                        </MultiCodeBlock>
                                    </dd>
                                ))}
                            </dl>
                        </main>
                        
                        <aside data-pagefind-ignore className="l-right">
                            <div className="l-toc" alpine:scroll="onScroll()">
                                <TableOfContents items={tocItems} withHeading />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RefListWithIds({ entry, currentUrl, helpers }) {
    if (!entry) return null;
    
    if (entry.type === 'object') {
        return <ObjectPropertiesWithIds entry={entry} currentUrl={currentUrl} helpers={helpers} />;
    }
    
    if (entry.type === 'array' && entry.items?.length) {
        return <ArrayItemsWithIds entry={entry} currentUrl={currentUrl} helpers={helpers} />;
    }
    
    if (entry.anyOf?.length) {
        return <AnyOfTypesWithIds entry={entry} currentUrl={currentUrl} helpers={helpers} />;
    }
    
    return null;
}

function ObjectPropertiesWithIds({ entry, currentUrl, helpers }) {
    const properties = Object.entries(entry.properties || {});
    const additionalProps = entry.additionalProperties || [];
    
    return (
        <>
            <dt id="properties">Properties:</dt>
            {properties.length > 0 ? (
                properties.map(([key, ref]) => (
                    <dd key={key} id={`prop-${slugify(key)}`}>
                        <RefItem 
                            docRef={ref} 
                            currentUrl={currentUrl} 
                            useKey
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
                    <dt id="additional-properties">Additional properties:</dt>
                    {additionalProps.map((ref, i) => {
                        const resolved = resolveRef(ref);
                        const label = getDisplayName(resolved) || `item-${i}`;
                        return (
                            <dd key={resolved?.gid || i} id={`addprop-${slugify(label)}`}>
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

function ArrayItemsWithIds({ entry, currentUrl, helpers }) {
    const items = entry.items || [];
    if (items.length === 0) return null;
    
    return (
        <>
            <dt id="items">Items:</dt>
            {items.map((ref, i) => {
                const resolved = resolveRef(ref);
                const label = getDisplayName(resolved) || `item-${i}`;
                return (
                    <dd key={resolved?.gid || i} id={`item-${slugify(label)}`}>
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

function AnyOfTypesWithIds({ entry, currentUrl, helpers }) {
    const anyOf = entry.anyOf || [];
    if (anyOf.length === 0) return null;
    
    return (
        <>
            <dt id="types">Types:</dt>
            {anyOf.map((ref, i) => {
                const resolved = resolveRef(ref);
                const label = getDisplayName(resolved) || `type-${i}`;
                return (
                    <dd key={resolved?.gid || i} id={`type-${slugify(label)}`}>
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

export const layout = "layouts/base.jsx";
