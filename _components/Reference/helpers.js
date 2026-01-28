export const BASE_URL = '/documentation/developer-reference/configuration-file';

// "Type reset" entries (parent === 'type.Configuration' && show_in_navigation) display title instead of key
export function getDisplayName(entry) {
    if (!entry) return 'unknown';
    const isTypeReset = entry.parent === 'type.Configuration' && entry.documentation?.show_in_navigation;
    return isTypeReset ? entry.title : entry.key;
}

export function getRefUrl(entry) {
    if (!entry?.url) return null;
    return `${BASE_URL}${entry.url}`;
}

// Resolves a reference, merging any documentation overrides
export function resolveRef(docRef) {
    if (!docRef) return null;
    
    const doc = DOCS[docRef.gid] || docRef;
    
    if (docRef.documentation) {
        return {
            ...doc,
            title: docRef.documentation.title || doc.title,
            description: docRef.documentation.description || doc.description,
            examples: docRef.documentation.examples?.length ? docRef.documentation.examples : doc.examples,
            documentation: docRef.documentation,
        };
    }
    
    return doc;
}

export function getDocByGid(gid) {
    if (!gid) return null;
    return DOCS[gid] || null;
}

// Check if gid is a descendant of parentGid (for nav active state)
export function isGidInside(gid, parentGid) {
    if (!gid) return false;
    if (parentGid === 'type.Configuration') return !gid.startsWith('type.');
    return gid.startsWith(`${parentGid}.`);
}

// Build breadcrumb chain from entry up to type-reset ancestor
export function getBreadcrumbChain(startDoc) {
    if (!startDoc) return [];
    
    const chain = [startDoc];
    let current = startDoc;
    
    while (current && current.parent !== 'type.Configuration') {
        const parentDoc = DOCS[current.parent];
        if (parentDoc) {
            chain.unshift(parentDoc);
            current = parentDoc;
        } else {
            break;
        }
    }
    
    return chain;
}

export function getParentGids(doc) {
    if (!doc) return [];
    
    const parentGids = [];
    let parentGid = doc.parent;
    
    while (parentGid) {
        parentGids.unshift(parentGid);
        const parentDoc = DOCS[parentGid];
        parentGid = parentDoc?.parent;
    }
    
    return parentGids;
}

export function isTypeReset(entry) {
    return entry?.parent === 'type.Configuration' && entry?.documentation?.show_in_navigation;
}
