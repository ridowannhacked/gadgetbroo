import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // getSessionCookie() checks both "better-auth.session_token" and the
  // "__Secure-" prefixed variant that Better Auth switches to automatically
  // when useSecureCookies is true (i.e. in production/NODE_ENV=production).
  // A hard-coded cookie name only matches in dev and silently bounces every
  // authenticated request back to /sign-in in production.
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
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

