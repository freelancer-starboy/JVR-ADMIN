import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAdminToken } from "lib/auth/jwt";

// "/" is the login page. Everything else (pages and /api/*) needs a valid admin JWT,
// except the auth endpoints below, Next internals (/_next) and static files.
const LOGIN_PATH = "/";
const HOME_PATH = "/dashboard";
const PUBLIC_API = new Set(["/api/auth/login", "/api/auth/logout"]);

// Files served from /public (e.g. /images/logo.png, /favicon.svg)
const STATIC_FILE = /\.[a-z0-9]+$/i;

// Returns a same-origin URL for `next`, or null if it isn't a safe in-app path.
function safeNextUrl(next, request) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return null;
  }
  try {
    const url = new URL(next, request.url);
    if (url.origin !== request.nextUrl.origin) return null;
    if (url.pathname === LOGIN_PATH || url.pathname === "/login") return null;
    return url;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/_next") || STATIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  if (PUBLIC_API.has(pathname)) {
    return NextResponse.next();
  }

  const session = await verifyAdminToken(request.cookies.get(AUTH_COOKIE)?.value);

  if (pathname === LOGIN_PATH) {
    if (!session) return NextResponse.next();
    // Already logged in: skip the login screen
    const target = safeNextUrl(request.nextUrl.searchParams.get("next"), request) || new URL(HOME_PATH, request.url);
    return NextResponse.redirect(target);
  }

  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const loginUrl = new URL(LOGIN_PATH, request.url);
  if (pathname !== HOME_PATH) {
    loginUrl.searchParams.set("next", `${pathname}${search || ""}`);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
