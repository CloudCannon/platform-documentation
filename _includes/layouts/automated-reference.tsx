import { 
    getDisplayName, 
    getRefUrl, 
    getDocByGid,
    resolveRef 
} from '../../_components/Reference/helpers.ts';
import { parseDocUrl, slugify } from '../../_components/utils/index.ts';
import MobileTOC from '../../_components/Layout/MobileTOC.tsx';
import NavSidebar from '../../_components/Layout/NavSidebar.tsx';
import RefType from '../../_components/Reference/RefType.tsx';
import PropertiesTable from '../../_components/Reference/PropertiesTable.tsx';
import DocNav from '../../_components/Reference/DocNav.tsx';
import MultiCodeBlock from '../../_components/MultiCodeBlock.tsx';
import Annotation from '../../_components/Annotation.tsx';
import type { 
    Helpers, 
    DocEntry, 
    Page, 
    PageSearch,
    ContentNavigation 
} from '../../_types.d.ts';

interface TocItem {
    id: string;
    label: string;
}

interface Props {
    entry?: DocEntry;
    page?: Page;
    navigation?: Record<string, ContentNavigation>;
    full_docs?: DocEntry[];
    url?: string;
    search?: PageSearch;
}

function DocName({ doc }: { doc?: DocEntry }) {
    if (!doc) return null;
    return doc.title ? doc.title : <code>{doc.key}</code>;
}

function DocLink({ doc }: { doc?: DocEntry }) {
    if (!doc) return null;
    const url = getRefUrl(doc);
    
    return <a href={url ?? undefined}><DocName doc={doc} /></a>
}

function PageBreadcrumb({ entry }: { entry: DocEntry }) {
    if (entry.url === '/') {
        return null;
    }
    
    return (<span>
        {/* <img src={helpers.icon('arrow_forward_ios:outlined', 'material')} inline="true" /> */}
        <a href='/documentation/developer-reference/configuration-file/'>Configuration File</a>
    </span>);
}


function getTocItems(entry: DocEntry): TocItem[] {
    const items: TocItem[] = [];
    
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

function TableOfContents({ items, withHeading = false }: { items: TocItem[], withHeading?: boolean }) {
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

function RecursiveBreadcrumb({ gid }: { gid?: string }) {
    if (!gid) return null;

    const breadcrumbChain: DocEntry[] = [];
    let parent: string | undefined = gid;
    while (parent) {
        const parentDoc = getDocByGid(parent);
        if (!parentDoc) break;
        breadcrumbChain.unshift(parentDoc);
        parent = parentDoc.parent;
    }
    if (breadcrumbChain.length === 0) return null;

    return breadcrumbChain.map((crumb, i) => (
        <span key={crumb.gid || i}>
            {i > 0 && <span>&rarr;</span>}
            <DocLink doc={crumb} />
        </span>
    ));
}

function AppearsIn({ doc }: { doc?: DocEntry }) {
    if (!doc) {
        return null;
    }
    const appearsIn = doc.appears_in || [];
    return <>
        <dt id="appears-in">Appears in:</dt>
        {doc.parent && (
            <dd>
                <RecursiveBreadcrumb gid={doc.parent} />
            </dd>
        )}
        {appearsIn.map((gid) => {
            return (
                <dd key={gid}>
                    <RecursiveBreadcrumb gid={gid} />
                </dd>
            );
        })}

        <dd></dd>
    </>;
}

export default function AutomatedReferenceLayout({ entry, page, navigation, full_docs, url, search }: Props, helpers: Helpers) {
    if (!entry) {
        return <div>Error: No entry provided</div>;
    }
    

    const currentUrl = page?.data?.url || url || '';
    const examples = (entry.documentation?.examples || []).filter(ex => ex.code);
    
    const { navKey: sectionKey } = parseDocUrl(currentUrl);
    const navData = navigation?.[sectionKey];
    
    const tocItems = getTocItems(entry);
    
    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                <NavSidebar className="developer-reference">
                    {navData && search && (
                        <DocNav 
                            navigation={navData}
                            currentDoc={entry}
                            currentUrl={currentUrl}
                            items={full_docs}
                            page={page}
                            search={search}
                            helpers={helpers}
                        />
                    )}
                </NavSidebar>
                
                <div className="u-card-box l-content" x-data="$visibleNavHighlighter">
                    <div className="l-breadcrumb">
                        <a href="/documentation/developer-reference/" style="text-transform: capitalize;">Developer Reference</a>
                        <PageBreadcrumb 
                            entry={entry} 
                        />
                    </div>
                    
                    <h1 data-pagefind-body className="l-heading u-margin-bottom-0">
                        <DocName doc={entry} />
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
                                <dt id="description" className={!entry.description ? 'show-in-cms' : undefined}>
                                    Description:
                                </dt>
                                <dd>
                                    {entry.description && (
                                        <span dangerouslySetInnerHTML={{ __html: helpers.md(entry.description) }} />
                                    )}
                                </dd>

                                <AppearsIn doc={entry} />
                                
                                {!entry.anyOf?.length && (
                                    <>
                                        <dt id="type">Type:</dt>
                                        <dd>
                                            <RefType doc={entry} currentUrl={currentUrl} />
                                        </dd>
                                    </>
                                )}
                                
                                {entry.default !== undefined && (
                                    <>
                                        <dt id="default-value">Default value:</dt>
                                        <dd><code>{String(entry.default)}</code></dd>
                                    </>
                                )}
                                
                                {entry.enum?.length && entry.enum.length > 0 && (
                                    <>
                                        <dt id="allowed-values">Allowed values:</dt>
                                        {entry.enum.map((val, i) => (
                                            <dd key={i}><code>{val}</code></dd>
                                        ))}
                                    </>
                                )}

                                <PropertiesTable entry={entry} currentUrl={currentUrl} helpers={helpers} withIds slugify={slugify} />
                                
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
                                                <Annotation key={j} number={annotation.number || 0}>
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

export const layout = "layouts/base.tsx";
