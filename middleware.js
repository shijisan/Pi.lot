import { NextResponse } from "next/server";
import { verify } from "jose";
import { parse } from "cookie";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await verify(token, process.env.JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
