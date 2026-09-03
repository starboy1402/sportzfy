import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("sportzfy_session")?.value;

  // Protected route definitions
  const isAdminRoute = pathname.startsWith("/admin");
  const isOwnerRoute = pathname.startsWith("/owner");

  if (!isAdminRoute && !isOwnerRoute) {
    return NextResponse.next();
  }

  // If not logged in at all, redirect to login
  if (!sessionCookie) {
    const roleParam = isAdminRoute ? "admin" : "owner";
    const loginUrl = new URL(`/login?role=${roleParam}&redirect=${encodeURIComponent(pathname)}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Parse session cookie
  try {
    const raw = Buffer.from(sessionCookie, "base64").toString("utf-8");
    const user = JSON.parse(raw);

    // 1. Admin route protection: must have role ADMIN
    if (isAdminRoute && user.role !== "ADMIN") {
      const loginUrl = new URL(`/login?role=admin&unauthorized=true&redirect=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Owner route protection: must have role OWNER or ADMIN
    if (isOwnerRoute && user.role !== "OWNER" && user.role !== "ADMIN") {
      const loginUrl = new URL(`/login?role=owner&unauthorized=true&redirect=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/owner/:path*"],
};
