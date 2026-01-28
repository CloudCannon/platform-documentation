/**
 * String utility functions shared across components
 */

/**
 * Formats a URL segment into a readable title
 * Replaces hyphens with spaces and capitalizes each word
 * @param {string} str - The string to format
 * @returns {string} Formatted title
 */
export function formatTitle(str) {
    if (!str) return '';
    return str.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Converts text to a URL-friendly slug
 * @param {string} text - The text to slugify
 * @returns {string} URL-friendly slug
 */
export function slugify(text) {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Truncates a string to a specified length with ellipsis
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length before truncation
 * @returns {string} Truncated string
 */
export function truncate(str, length) {
    const text = String(str || '');
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}
