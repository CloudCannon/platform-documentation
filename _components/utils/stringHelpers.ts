/** Adapted from https://github.com/sindresorhus/slugify/blob/main/index.js */

const NotALetterOrNumber = /[^\p{L}\p{N}]/gu;

export interface SlugifyOptions {
	separator?: string;
	preserveLeadingUnderscore?: boolean;
	preserveTrailingDash?: boolean;
	decamelize?: boolean;
	lowercase?: boolean;
}

export function slugify(stringToSlugify: string, options?: SlugifyOptions): string {
	if (typeof stringToSlugify !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof stringToSlugify}\``);
	}

	const separator = options?.separator ?? '-';
	const shouldPrependLeadingUnderscore =
		options?.preserveLeadingUnderscore && stringToSlugify.startsWith('_');
	const shouldAppendDash = options?.preserveTrailingDash && stringToSlugify.endsWith('-');

	let slug = stringToSlugify;

	if (options?.decamelize) {
		slug = slug
			// Separate capitalized words.
			.replace(/([A-Z]{2,})(\d+)/g, '$1 $2')
			.replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')

			.replace(/([a-z\d])([A-Z])/g, '$1 $2')
			// `[a-rt-z]` matches all lowercase characters except `s`.
			// This avoids matching plural acronyms like `APIs`.
			.replace(/([A-Z]+)([A-Z][a-rt-z\d]+)/g, '$1 $2');
	}

	if (options?.lowercase !== false) {
		slug = slug.toLowerCase();
	}

	slug = slug
		.replace(NotALetterOrNumber, separator)
		.replace(new RegExp(`${separator}+`, 'g'), separator) // collapse multiple separators
		.replace(new RegExp(`^${separator}|${separator}$`, 'g'), ''); // remove leading and trailing separators

	if (shouldPrependLeadingUnderscore) {
		slug = `_${slug}`;
	}
	if (shouldAppendDash) {
		slug = `${slug}-`;
	}

	return slug;
}

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
