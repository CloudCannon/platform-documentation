import { getDisplayName, getRefUrl, resolveRef, isGidInside } from './helpers.js';

function ObjectNavItems({ entry, currentDoc }) {
    const properties = Object.entries(entry.properties || {});
    const additionalProps = entry.additionalProperties || [];
    
    return (
        <ol className="t-docs-nav__sub-list">
            {properties.map(([key, propRef]) => {
                const propDoc = resolveRef(propRef);
                if (!propDoc?.url) return null;
                
                const isCurrentPage = propDoc.url === currentDoc.url;
                const url = getRefUrl(propDoc);
                
                return (
                    <li key={key}>
                        {isCurrentPage ? (
                            <span className="t-docs-nav__sub-list__article" aria-current="page">{key}</span>
                        ) : (
                            <a className="t-docs-nav__sub-list__article" href={url}>{key}</a>
                        )}
                    </li>
                );
            })}
            
            {additionalProps.map((ref, i) => {
                const propDoc = resolveRef(ref);
                if (!propDoc?.url) return null;
                
                const isCurrentPage = propDoc.url === currentDoc.url;
                const url = getRefUrl(propDoc);
                const name = getDisplayName(propDoc);
                
                return (
                    <li key={propDoc.gid || i}>
                        {isCurrentPage ? (
                            <span className="t-docs-nav__sub-list__article" aria-current="page">{name}</span>
                        ) : (
                            <a className="t-docs-nav__sub-list__article" href={url}>{name}</a>
                        )}
                    </li>
                );
            })}
            
            {additionalProps.length === 1 && (() => {
                const propDoc = resolveRef(additionalProps[0]);
                if (propDoc?.anyOf?.length) {
                    return (
                        <li>
                            <AnyOfNavItems entry={propDoc} currentDoc={currentDoc} />
                        </li>
                    );
                }
                return null;
            })()}
        </ol>
    );
}

function AnyOfNavItems({ entry, currentDoc }) {
    const anyOf = entry.anyOf || [];
    
    return (
        <ol className="t-docs-nav__sub-list">
            {anyOf.map((ref, i) => {
                const anyOfDoc = resolveRef(ref);
                if (!anyOfDoc?.url) return null;
                
                const isCurrentPage = anyOfDoc.url === currentDoc.url;
                const url = getRefUrl(anyOfDoc);
                const name = getDisplayName(anyOfDoc);
                
                return (
                    <li key={anyOfDoc.gid || i}>
                        {isCurrentPage ? (
                            <span className="t-docs-nav__sub-list__article" aria-current="page">{name}</span>
                        ) : (
                            <a className="t-docs-nav__sub-list__article" href={url}>{name}</a>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function ArrowIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M6.23 20.23 8 22l10-10L8 2 6.23 3.77 14.46 12z" />
        </svg>
    );
}

export default function RefNavItem({ entry, currentDoc, currentUrl }) {
    if (!entry?.url) return null;
    
    const url = getRefUrl(entry);
    const name = getDisplayName(entry);
    const docUrl = currentUrl.replace('/documentation/developer-reference/configuration-file/', '');
    const isActive = (entry.url + '/') === docUrl;
    const hasActiveChild = currentDoc?.gid && isGidInside(currentDoc.gid, entry.gid);
    const shouldExpand = isActive || hasActiveChild;
    
    return (
        <li>
            {isActive ? (
                <div className="t-docs-nav__main-list__item__heading-group t-docs-nav__sub-list__article nav-open">
                    <span className="t-docs-nav__main-list__item__heading">{name}</span>
                    <ArrowIcon />
                </div>
            ) : (
                <a className="t-docs-nav__sub-list__article" href={url}>{name}</a>
            )}
            
            {shouldExpand && entry.type === 'object' && (
                <ObjectNavItems entry={entry} currentDoc={currentDoc} />
            )}
            {shouldExpand && entry.anyOf?.length > 0 && (
                <AnyOfNavItems entry={entry} currentDoc={currentDoc} />
            )}
        </li>
    );
}

export { ObjectNavItems, AnyOfNavItems };
