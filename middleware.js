import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { parse } from "cookie";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Check both dashboard and organization routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/organization/")) {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Verify token
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      
      // If accessing an organization page, verify authorization
      if (pathname.startsWith("/organization/")) {
        const orgId = pathname.split("/")[2];

        // Make API calls to check organization access
        const [ownedRes, memberRes] = await Promise.all([
          fetch(`${req.nextUrl.origin}/api/organizations/owned`, {
            headers: { cookie: `token=${token}` }
          }),
          fetch(`${req.nextUrl.origin}/api/organizations/member`, {
            headers: { cookie: `token=${token}` }
          })
        ]);

        if (!ownedRes.ok || !memberRes.ok) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        const [ownedOrgs, memberOrgs] = await Promise.all([
          ownedRes.json(),
          memberRes.json()
        ]);

        // Check if user owns or is member of the organization
        const isOwner = ownedOrgs.some(org => org.id === orgId);
        const isMember = memberOrgs.some(member => member.organization.id === orgId);

        if (!isOwner && !isMember) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }

      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/organization/:path*']
};