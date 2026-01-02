/**
 * Input sanitization utilities for XSS protection
 *
 * Note: React already escapes content by default, but these utilities
 * provide defense-in-depth at the input layer.
 */

/**
 * Strip HTML tags from a string
 * Use for text-only inputs like names, titles, etc.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Escape HTML entities
 * Converts < > & " ' to their HTML entity equivalents
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return input.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Validate and sanitize a URL
 * Only allows http, https, and mailto protocols
 * Returns null if URL is invalid or uses dangerous protocol
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const allowedProtocols = ["http:", "https:", "mailto:"];

    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize text input by stripping HTML and limiting length
 * @param input The input string
 * @param maxLength Maximum allowed length (default: 10000)
 */
export function sanitizeTextInput(input: string, maxLength: number = 10000): string {
  return stripHtml(input).slice(0, maxLength);
}

/**
 * Sanitize a filename to prevent path traversal
 * Removes directory separators and null bytes
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, "") // Remove directory traversal
    .replace(/[/\\]/g, "") // Remove path separators
    .replace(/\0/g, "") // Remove null bytes
    .trim();
}

/**
 * Check if a string contains potential XSS patterns
 * Returns true if suspicious patterns are found
 */
export function containsXssPatterns(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /data:/i,
    /vbscript:/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}
