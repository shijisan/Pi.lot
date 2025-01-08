import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST(req) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const cookie = serialize("token", token, { httpOnly: true, maxAge: 60 * 60, path: "/" });
  const res = NextResponse.json({ message: "Logged in successfully" });
  res.headers.set("Set-Cookie", cookie);

  return res;
}
