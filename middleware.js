import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { parse } from "cookie";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    console.log(cookies);

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)); 
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
