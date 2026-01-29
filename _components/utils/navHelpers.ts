/**
 * Navigation utility functions shared across nav components
 */

interface NavBlock {
    _bubbled?: string[];
}

/**
 * Checks if the current page matches a target URL
 * @param currentUrl - The current page URL  
 * @param targetUrl - The URL to check against
 * @returns Whether URLs match
 */
export function isActivePage(currentUrl: string, targetUrl: string): boolean {
    if (!currentUrl || !targetUrl) return false;
    return currentUrl === targetUrl;
}

/**
 * Checks if a navigation block should be marked as active based on bubbled UUIDs
 * @param block - The navigation block with _bubbled array
 * @param pageUuid - The current page's UUID
 * @returns Whether the nav item is active
 */
export function isActiveNavItem(block: NavBlock, pageUuid: string): boolean {
    if (!block?._bubbled || !pageUuid) return false;
    return block._bubbled.includes(pageUuid);
}

/**
 * Returns aria-current attribute object if URLs match
 * @param currentUrl - The current page URL
 * @param targetUrl - The URL to check against
 * @returns Empty object or aria-current attribute
 */
export function getAriaCurrent(currentUrl: string, targetUrl: string): Record<string, string> | Record<string, never> {
    if (isActivePage(currentUrl, targetUrl)) {
        return { 'aria-current': 'page' };
    }
    return {};
}

/**
 * Builds navigation className string with active states
 * @param baseClass - The base CSS class
 * @param isActive - Whether the item is active
 * @param isOpen - Whether the item is open/expanded
 * @returns Combined class string
 */
export function getNavItemClassName(baseClass: string, isActive = false, isOpen = false): string {
    const classes = [baseClass];
    if (isActive) classes.push('is-active');
    if (isOpen) classes.push('nav-open');
    return classes.join(' ');
}
