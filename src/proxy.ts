import { getToken, type JWT } from "next-auth/jwt";
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
// Matches authjs.session-token, __Secure-authjs.session-token and their chunks (.0, .1, …)
const SESSION_COOKIE = "authjs.session-token";

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

  // A token whose refresh failed can't be revived. Counting it as logged in
  // sent /login back to /dashboard and the client back to /login, forever.
  const deadSession = !!token?.error;
  const res = route(req, deadSession ? null : token);

  if (deadSession) {
    for (const { name } of req.cookies.getAll()) {
      if (name.includes(SESSION_COOKIE)) {
        res.cookies.set(name, "", { maxAge: 0, path: "/", secure: name.startsWith("__Secure-") });
      }
    }
  }

  return res;
}

function route(req: NextRequest, session: JWT | null) {
  const { pathname } = req.nextUrl;
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Redirect authenticated users away from auth pages
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users to login
  if (!session && !isAuthPath) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    const isClientOnly = CLIENT_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    if (isClientOnly && session.role !== "client") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const isWalkerOnly = WALKER_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
    if (isWalkerOnly && session.role !== "walker") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
