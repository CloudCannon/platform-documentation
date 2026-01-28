/**
 * RefNav - Reference navigation sidebar
 * 
 * Replaces referencenav.njk
 * Renders the list of top-level navigation items for the configuration reference
 */

import RefNavItem from './RefNavItem.jsx';

/**
 * Reference navigation list
 * 
 * @param {Object} props
 * @param {Object} props.currentDoc - The current page's documentation entry
 * @param {string} props.currentUrl - Current page URL
 * @param {Array} props.items - Array of all documentation entries (full_docs)
 */
export default function RefNav({ currentDoc, currentUrl, items }) {
    // Filter to only show items that should appear in navigation
    const navItems = (items || []).filter(item => 
        item.documentation?.show_in_navigation
    );
    
    return (
        <ol className="t-docs-nav__sub-list">
            {navItems.map(item => (
                <RefNavItem 
                    key={item.gid}
                    entry={item}
                    currentDoc={currentDoc}
                    currentUrl={currentUrl}
                />
            ))}
        </ol>
    );
}
