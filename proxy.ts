import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next.js 15+ removed 'ip' from the default NextRequest type.
interface CustomNextRequest extends NextRequest {
  ip?: string;
}

// Simple in-memory token bucket for rate limiting
const rateLimitCache = new Map<string, { count: number; expiresAt: number }>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitCache.entries()) {
    if (now > data.expiresAt) {
      rateLimitCache.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function proxy(request: CustomNextRequest) {
  const { pathname } = request.nextUrl;

  // 1. --- RATE LIMITING (Security Shield) ---
  const isProtectedApi = 
    pathname.startsWith('/api/checkout') ||
    pathname.startsWith('/api/comments') ||
    pathname.startsWith('/api/reviews') ||
    pathname.startsWith('/api/media') ||
    pathname.startsWith('/api/imagekit-upload-auth');

  if (isProtectedApi) {
    let ip = request.ip || 
             request.headers.get("x-real-ip") || 
             request.headers.get("x-forwarded-for")?.split(",")[0] || 
             "127.0.0.1";
    ip = ip.trim();

    // 30 requests per minute per IP
    const LIMIT = 30;
    const WINDOW_MS = 60 * 1000;
    const now = Date.now();

    const currentData = rateLimitCache.get(ip);

    if (!currentData || now > currentData.expiresAt) {
      rateLimitCache.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    } else {
      currentData.count++;
      if (currentData.count > LIMIT) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Too Many Requests", 
            message: "You are being rate limited. Please try again in a minute." 
          }),
          { 
            status: 429, 
            headers: { 
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((currentData.expiresAt - now) / 1000).toString()
            } 
          }
        );
      }
    }
  }

  // 2. --- AUTHENTICATION REDIRECTS (Original Logic) ---
  // getSessionCookie() checks both "better-auth.session_token" and the
  // "__Secure-" prefixed variant that Better Auth switches to automatically
  const sessionCookie = getSessionCookie(request);

  const isAuthedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin");

  // No cookie at all → definitely not logged in → redirect immediately
  if (isAuthedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/admin/:path*",
    "/api/checkout/:path*",
    "/api/comments/:path*",
    "/api/reviews/:path*",
    "/api/media/:path*",
    "/api/imagekit-upload-auth/:path*"
  ],
};
