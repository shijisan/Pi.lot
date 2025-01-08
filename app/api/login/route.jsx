import bcrypt from "bcryptjs";
import { sign } from "jose";
import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST(req) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const token = sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const cookie = serialize("token", token, { httpOnly: true, maxAge: 60 * 60, path: "/" });
  const res = NextResponse.json({ message: "Logged in successfully" });
  res.headers.set("Set-Cookie", cookie);

  return res;
}
