import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const CLIENT_ONLY_PREFIXES = ["/dogs", "/walkers", "/walks/new"];
const WALKER_ONLY_PREFIXES = [
  "/profile/walker-profile",
  "/profile/documents",
  "/profile/bank-account",
  "/walk-requests",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect authenticated users away from auth pages
  if (token && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users to login
  if (!token && !AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const isClientOnly = CLIENT_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    if (isClientOnly && token.role !== "client") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const isWalkerOnly = WALKER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    if (isWalkerOnly && token.role !== "walker") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
