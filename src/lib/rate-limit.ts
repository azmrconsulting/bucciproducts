/**
 * In-memory rate limiter for auth endpoints
 *
 * SECURITY: Protects against brute force attacks, credential stuffing, and DoS
 *
 * Note: This is a simple in-memory implementation suitable for single-instance deployments.
 * For multi-instance deployments, consider using Redis-based rate limiting (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

// Store rate limit data by IP address
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (typically IP address or IP + endpoint)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or expired entry
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.interval;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  // Entry exists and not expired
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimitConfigs = {
  // Login: 5 attempts per 15 minutes per IP
  login: {
    interval: 15 * 60 * 1000,
    maxRequests: 5,
  },
  // Registration: 3 accounts per hour per IP
  register: {
    interval: 60 * 60 * 1000,
    maxRequests: 3,
  },
  // Password reset request: 3 per hour per IP
  forgotPassword: {
    interval: 60 * 60 * 1000,
    maxRequests: 3,
  },
  // Password reset completion: 5 per hour per IP
  resetPassword: {
    interval: 60 * 60 * 1000,
    maxRequests: 5,
  },
  // General API: 100 requests per minute per IP
  api: {
    interval: 60 * 1000,
    maxRequests: 100,
  },
};

/**
 * Get client IP from request headers
 * Works with common proxies and load balancers
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback - shouldn't reach here in production behind a proxy
  return 'unknown';
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
  };
}
