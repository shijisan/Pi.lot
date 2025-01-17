import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma'; // Your Prisma client
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose'; // Import SignJWT from jose
import { TextEncoder } from 'util'; // Import TextEncoder for encoding your secret

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(req) {
  const { email, password, fullName } = await req.json();

  try {
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing values.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });

    // Create a JWT token for the new user
    const token = await new SignJWT({ userId: newUser.id })
      .setIssuedAt()
      .setExpirationTime('1h')
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })  // Set protected header
      .sign(new TextEncoder().encode(SECRET_KEY));  // Sign the JWT using your secret key

    cookies().set('authToken', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production', // Secure flag in production
    });

    return NextResponse.json({ message: 'User created successfully', token }, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
