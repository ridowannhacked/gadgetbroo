import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // BetterAuth's session cookie name

  const sessionCookie = request.cookies.get("better-auth.session_token");

  // console.log(sessionCookie)

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

