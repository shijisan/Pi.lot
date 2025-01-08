import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST(req) {
  const { email, fullName, password } = await req.json();
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, fullName, password: hashedPassword },
  });

  const token = new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  const cookie = serialize("token", token, { httpOnly: true, maxAge: 60 * 60, path: "/" });
  const res = NextResponse.json({ message: "Registered successfully" });
  res.headers.set("Set-Cookie", cookie);

  return res;
}
