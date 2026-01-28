/**
 * ReferencePage - Main page component for configuration reference
 * 
 * Replaces layouts/automated-reference.njk
 * Renders the complete reference page with navigation, breadcrumbs, content, and TOC
 */

import { getDisplayName, getRefUrl, getBreadcrumbChain, getDocByGid, BASE_URL } from './helpers.js';
import { parseDocUrl, formatTitle } from '../utils/index.js';
import MobileTOC from '../Layout/MobileTOC.jsx';
import TypeDisplay from './TypeDisplay.jsx';
import RefList from './RefList.jsx';
import RefNav from './RefNav.jsx';
import MultiCodeBlock from '../MultiCodeBlock.jsx';
import Annotation from '../Annotation.jsx';

/**
 * Renders the breadcrumb trail
 */
function Breadcrumbs({ entry, parent, appearsIn }, helpers) {
    const totalAppearsIn = (parent ? 1 : 0) + appearsIn.length;
    
    // Only show breadcrumbs if there's exactly one parent
    if (totalAppearsIn !== 1) return null;
    
    const singleParent = parent || getDocByGid(appearsIn[0]);
    const breadcrumbChain = getBreadcrumbChain(singleParent);
    
    return (
        <>
            {breadcrumbChain.map((crumb, i) => (
                <span key={crumb.gid || i}>
                    <img 
                        src={helpers.icon('arrow_forward_ios:outlined', 'material')} 
                        inline="true"
                    />
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

/**
 * Renders the "Appears in" section when entry has multiple parents
 */
function AppearsIn({ parent, appearsIn }) {
    const totalAppearsIn = (parent ? 1 : 0) + appearsIn.length;
    
    if (totalAppearsIn <= 1) return null;
    
    return (
        <>
            <dt>Appears in:</dt>
            {parent && (
                <dd>
                    {parent.url === '/' ? (
                        'Configuration File'
                    ) : (
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
                        {doc.url === '/' ? (
                            'Configuration File'
                        ) : (
                            <a href={getRefUrl(doc)}>
                                <code>{doc.full_key}</code>
                            </a>
                        )}
                    </dd>
                );
            })}
        </>
    );
}

/**
 * Renders the examples section
 */
function Examples({ examples }, helpers) {
    const validExamples = (examples || []).filter(example => example.code);
    
    if (!validExamples.length) {
        return (
            <dt className="show-in-cms">Examples:</dt>
        );
    }
    
    return (
        <>
            <dt>Examples:</dt>
            {validExamples.map((example, i) => (
                <div key={i}>
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
                </div>
            ))}
        </>
    );
}

/**
 * Main ReferencePage component
 * 
 * This is designed to be used as a layout component.
 * It receives entry, page, and other data from the page generator.
 * 
 * @param {Object} props
 * @param {Object} props.entry - The documentation entry for this page
 * @param {Object} props.page - Lume page object
 * @param {Object} props.navigation - Navigation data
 * @param {Array} props.full_docs - All documentation entries
 * @param {Object} helpers - Lume helpers (icon, md, etc.)
 */
export default function ReferencePage({ entry, page, navigation, full_docs }, helpers) {
    if (!entry) {
        return <div>Error: No entry provided</div>;
    }
    
    const displayName = getDisplayName(entry);
    const parent = entry.parent ? getDocByGid(entry.parent) : null;
    const appearsIn = entry.appears_in || [];
    const currentUrl = page?.data?.url || '';
    const examples = entry.documentation?.examples || [];
    
    // Parse URL for section name
    const { navKey } = parseDocUrl(currentUrl);
    const sectionName = formatTitle(navKey) || 'Developer Reference';
    
    return (
        <div className="l-page" x-init="showmobilenav = true">
            <div className="l-column">
                {/* Sidebar Navigation */}
                <aside className="l-left developer-reference" x-data="{ more: true }">
                    <RefNav 
                        currentDoc={entry}
                        currentUrl={currentUrl}
                        items={full_docs}
                    />
                </aside>
                
                {/* Main Content */}
                <div className="u-card-box l-content" x-data="$visibleNavHighlighter">
                    {/* Breadcrumb */}
                    <div className="l-breadcrumb">
                        <span style={{ textTransform: 'capitalize' }}>{sectionName}</span>
                        <Breadcrumbs 
                            entry={entry} 
                            parent={parent} 
                            appearsIn={appearsIn}
                            helpers={helpers}
                        />
                    </div>
                    
                    {/* Page Title */}
                    <h1 data-pagefind-body className="l-heading u-margin-bottom-0">
                        {displayName}
                    </h1>
                    
                    {/* Mobile TOC */}
                    <MobileTOC helpers={helpers} />
                    
                    {/* Content Area */}
                    <div 
                        data-pagefind-body 
                        data-pagefind-filter="site:Documentation" 
                        data-pagefind-meta="site:Documentation" 
                        className="l-content-split"
                    >
                        <main>
                            <dl>
                                {/* Full key (if different from key) */}
                                {entry.full_key !== entry.key && (
                                    <>
                                        <dt>Full key:</dt>
                                        <dd><code>{entry.full_key}</code></dd>
                                    </>
                                )}
                                
                                {/* Description */}
                                <dt className={!entry.description ? 'show-in-cms' : undefined}>
                                    Description:
                                </dt>
                                <dd>
                                    {entry.description && (
                                        <span dangerouslySetInnerHTML={{ 
                                            __html: helpers.md(entry.description) 
                                        }} />
                                    )}
                                </dd>
                                
                                {/* Type (not shown for anyOf) */}
                                {!entry.anyOf?.length && (
                                    <>
                                        <dt>Type:</dt>
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
                                
                                {/* Appears in (multiple parents) */}
                                <AppearsIn parent={parent} appearsIn={appearsIn} />
                                
                                {/* Default value */}
                                {entry.default !== undefined && (
                                    <>
                                        <dt>Default value:</dt>
                                        <dd><code>{String(entry.default)}</code></dd>
                                    </>
                                )}
                                
                                {/* Allowed values (enum) */}
                                {entry.enum?.length > 0 && (
                                    <>
                                        <dt>Allowed values:</dt>
                                        {entry.enum.map((val, i) => (
                                            <dd key={i}><code>{val}</code></dd>
                                        ))}
                                    </>
                                )}
                            </dl>
                            
                            {/* Properties, Items, or Types list */}
                            <RefList entry={entry} currentUrl={currentUrl} helpers={helpers} />
                            
                            {/* Examples */}
                            <Examples examples={examples} helpers={helpers} />
                        </main>
                        
                        {/* Right sidebar TOC */}
                        <aside data-pagefind-ignore className="l-right">
                            <div className="l-toc" data-toc-scroll="true" />
                        </aside>
                    </div>
                    
                    {/* Related articles would go here if needed */}
                </div>
            </div>
        </div>
    );
}
