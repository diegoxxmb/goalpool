import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // dejar pasar todo (modo seguro para debug)
  return NextResponse.next();
}

export const config = {
  matcher: [],
};