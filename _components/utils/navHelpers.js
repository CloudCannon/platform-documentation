/**
 * Navigation utility functions shared across nav components
 */

/**
 * Checks if the current page matches a target URL
 * @param {string} currentUrl - The current page URL  
 * @param {string} targetUrl - The URL to check against
 * @returns {boolean}
 */
export function isActivePage(currentUrl, targetUrl) {
    if (!currentUrl || !targetUrl) return false;
    return currentUrl === targetUrl;
}

/**
 * Checks if a navigation block should be marked as active based on bubbled UUIDs
 * @param {Object} block - The navigation block with _bubbled array
 * @param {string} pageUuid - The current page's UUID
 * @returns {boolean}
 */
export function isActiveNavItem(block, pageUuid) {
    if (!block?._bubbled || !pageUuid) return false;
    return block._bubbled.includes(pageUuid);
}

/**
 * Returns aria-current attribute object if URLs match
 * @param {string} currentUrl - The current page URL
 * @param {string} targetUrl - The URL to check against
 * @returns {Object} Empty object or { 'aria-current': 'page' }
 */
export function getAriaCurrent(currentUrl, targetUrl) {
    if (isActivePage(currentUrl, targetUrl)) {
        return { 'aria-current': 'page' };
    }
    return {};
}

/**
 * Builds navigation className string with active states
 * @param {string} baseClass - The base CSS class
 * @param {boolean} isActive - Whether the item is active
 * @param {boolean} isOpen - Whether the item is open/expanded
 * @returns {string} Combined class string
 */
export function getNavItemClassName(baseClass, isActive = false, isOpen = false) {
    const classes = [baseClass];
    if (isActive) classes.push('is-active');
    if (isOpen) classes.push('nav-open');
    return classes.join(' ');
}
