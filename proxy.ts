import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle image requests - proxy to persistent storage
  if (pathname.startsWith("/images/")) {
    // Rewrite to serve from public directory
    const url = req.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.rewrite(url);
  }

  // Handle API routes - allow through
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Apply authentication for dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/images/:path*", "/api/:path*"],
};
