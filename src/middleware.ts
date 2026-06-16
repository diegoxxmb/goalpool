import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";

  const isDashboard = pathname.startsWith("/dashboard");

  // si está en dashboard pero no logueado → lo mandas a login
  if (isDashboard) {
    const token = req.cookies.get("sb-access-token");

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // si ya está logueado y entra a login/register → lo mandas al dashboard
  if (isAuthPage) {
    const token = req.cookies.get("sb-access-token");

    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};