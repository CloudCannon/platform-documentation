/**
 * URL utility functions shared across components
 */

/**
 * Parses a documentation URL to extract navigation key and path parts
 * @param {string} url - The full URL (e.g., "/documentation/articles/getting-started/")
 * @returns {{ navKey: string, urlParts: string[], urlPath: string }}
 */
export function parseDocUrl(url) {
    const urlPath = (url || '').replace("/documentation/", "");
    const urlParts = urlPath.split("/").filter(Boolean);
    return { 
        navKey: urlParts[0] || '', 
        urlParts, 
        urlPath 
    };
}

/**
 * Checks if the current URL matches a target URL
 * @param {string} currentUrl - The current page URL
 * @param {string} targetUrl - The URL to check against
 * @returns {boolean}
 */
export function urlsMatch(currentUrl, targetUrl) {
    if (!currentUrl || !targetUrl) return false;
    // Normalize URLs by removing trailing slashes for comparison
    const normalize = (url) => url.replace(/\/$/, '');
    return normalize(currentUrl) === normalize(targetUrl);
}
