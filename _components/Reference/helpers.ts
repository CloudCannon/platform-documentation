import { DocEntry } from "./types.d.ts";

export const BASE_URL = '/documentation/developer-reference/configuration-file';

// "Type reset" entries (parent === 'type.Configuration' && show_in_navigation) display title instead of key
export function getDisplayName(entry: DocEntry | null | undefined): string {
    if (!entry) return 'unknown';

    // TODO if it is a key, we want it presented in monospace font
    return entry.title || entry.key || 'unknown';
}

export function getRefUrl(entry: DocEntry | null | undefined): string | null {
    if (!entry?.url) return null;
    return `${BASE_URL}${entry.url}`;
}

// Resolves a reference, merging any documentation overrides
export function resolveRef(docRef: DocEntry | null | undefined): DocEntry | null {
    if (!docRef) return null;
    
    const doc = (docRef.gid && globalThis.DOCS?.[docRef.gid]) || docRef;
    
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

export function getDocByGid(gid: string | null | undefined): DocEntry | null {
    if (!gid) return null;
    return globalThis.DOCS?.[gid] || null;
}

// Check if gid is a descendant of parentGid (for nav active state)
export function isGidInside(gid: string | undefined, parentGid: string): boolean {
    if (!gid) return false;
    if (parentGid === 'type.Configuration') return !gid.startsWith('type.');
    return gid.startsWith(`${parentGid}.`);
}

// Build breadcrumb chain from entry up to type-reset ancestor
export function getBreadcrumbChain(startDoc: DocEntry | null | undefined): DocEntry[] {
    if (!startDoc) return [];
    
    const chain = [startDoc];
    let current: DocEntry | null | undefined = startDoc;
    
    while (current && current.parent !== 'type.Configuration') {
        const parentDoc: DocEntry | null | undefined = current.parent ? globalThis.DOCS?.[current.parent] : null;
        if (parentDoc) {
            chain.unshift(parentDoc);
            current = parentDoc;
        } else {
            break;
        }
    }
    
    return chain;
}

export function getParentGids(doc: DocEntry | null | undefined): string[] {
    if (!doc) return [];
    
    const parentGids: string[] = [];
    let parentGid = doc.parent;
    
    while (parentGid) {
        parentGids.unshift(parentGid);
        const parentDoc = globalThis.DOCS?.[parentGid];
        parentGid = parentDoc?.parent;
    }
    
    return parentGids;
}

export function isTypeReset(entry: DocEntry | null | undefined): boolean {
    return entry?.parent === 'type.Configuration' && entry?.documentation?.show_in_navigation === true;
}
