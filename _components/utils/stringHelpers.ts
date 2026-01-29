/**
 * String utility functions shared across components
 */

/**
 * Formats a URL segment into a readable title
 * Replaces hyphens with spaces and capitalizes each word
 * @param str - The string to format
 * @returns Formatted title
 */
export function formatTitle(str: string): string {
    if (!str) return '';
    return str.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Converts text to a URL-friendly slug
 * @param text - The text to slugify
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Truncates a string to a specified length with ellipsis
 * @param str - The string to truncate
 * @param length - Maximum length before truncation
 * @returns Truncated string
 */
export function truncate(str: string, length: number): string {
    const text = String(str || '');
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}
