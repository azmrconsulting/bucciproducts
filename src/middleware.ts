import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Simple in-memory rate limiter for middleware
 * Note: Separate from the API rate limiter as middleware runs on Edge
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const loginRateLimitStore = new Map<string, RateLimitEntry>();
const LOGIN_RATE_LIMIT = { interval: 15 * 60 * 1000, maxRequests: 5 }; // 5 attempts per 15 minutes

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function checkLoginRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = loginRateLimitStore.get(ip);

  // Cleanup old entries periodically
  if (loginRateLimitStore.size > 1000) {
    for (const [key, val] of loginRateLimitStore.entries()) {
      if (val.resetTime < now) loginRateLimitStore.delete(key);
    }
  }

  if (!entry || entry.resetTime < now) {
    const resetTime = now + LOGIN_RATE_LIMIT.interval;
    loginRateLimitStore.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: LOGIN_RATE_LIMIT.maxRequests - 1, resetTime };
  }

  if (entry.count >= LOGIN_RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: LOGIN_RATE_LIMIT.maxRequests - entry.count, resetTime: entry.resetTime };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // SECURITY: Rate limit login attempts (NextAuth credentials callback)
  if (pathname === '/api/auth/callback/credentials' && request.method === 'POST') {
    const clientIp = getClientIp(request);
    const rateLimit = checkLoginRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': LOGIN_RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  // Check if the request is for an admin route
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no token or user is not an admin, redirect to login
    if (!token || token.role !== 'ADMIN') {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      url.searchParams.set('error', 'AdminAccessRequired');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/auth/callback/credentials'],
};
