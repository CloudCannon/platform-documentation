/**
 * URL utility functions shared across components
 */

interface ParsedDocUrl {
  navKey: string;
  urlParts: string[];
  urlPath: string;
}

/**
 * Parses a documentation URL to extract navigation key and path parts
 * @param url - The full URL (e.g., "/documentation/articles/getting-started/")
 * @returns Parsed URL components
 */
export function parseDocUrl(url: string): ParsedDocUrl {
  const urlPath = (url || "").replace("/documentation/", "");
  const urlParts = urlPath.split("/").filter(Boolean);
  return {
    navKey: urlParts[0] || "",
    urlParts,
    urlPath,
  };
}

/**
 * Checks if the current URL matches a target URL
 * @param currentUrl - The current page URL
 * @param targetUrl - The URL to check against
 * @returns Whether URLs match
 */
export function urlsMatch(currentUrl: string, targetUrl: string): boolean {
  if (!currentUrl || !targetUrl) return false;
  // Normalize URLs by removing trailing slashes for comparison
  const normalize = (url: string) => url.replace(/\/$/, "");
  return normalize(currentUrl) === normalize(targetUrl);
}
