import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma'; // Your Prisma client
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose'; // Import SignJWT from 'jose'
import { TextEncoder } from 'util'; // Import TextEncoder to encode the secret key

// Define a secret key (store it securely, don't hardcode in prod)
const SECRET_KEY = process.env.JWT_SECRET; // Use a strong secret key from environment variables

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing values.' }, { status: 400 });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Create a JWT token for the user
    let token;
    try {
      token = await new SignJWT({ userId: user.id }) // Payload contains the user ID
        .setIssuedAt() // Set the "iat" (issued at) claim
        .setExpirationTime('1h') // Set expiration time (e.g., 1 hour)
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' }) // Set the algorithm and token type in the header
        .sign(new TextEncoder().encode(SECRET_KEY)); // Use the secret key to sign the token
    } catch (err) {
      return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
    }

    // Set the JWT token in cookies (httpOnly, secure in production)
    await cookies().set('authToken', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production', // Secure flag in production
    });

    // Return a success response with the token
    return NextResponse.json({ message: 'Login successful', token }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
