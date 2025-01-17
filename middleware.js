import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Correct import for JWT verification
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET;

export async function middleware(req) {
  try {
    console.log("secret key:", SECRET_KEY);
    // Explicitly await cookies() and get the auth token
    const cookieStore = await cookies(); // Await cookies retrieval first
    const token = cookieStore.get('authToken'); // Now get the cookie

    if (!token) {
      console.error('No valid token found');
      return NextResponse.redirect(new URL('/login', req.url)); // Token should be a string
    }

    console.log("authtoken found:", token); // Token is fetched correctly, check its structure

    // Try to verify the JWT token using the secret key
    try {
      const { payload } = await jwtVerify(token.value, new TextEncoder().encode(SECRET_KEY)); // Ensure token is passed as string (use token.value)

      console.log('JWT Payload:', payload); // Log the payload for debugging

      if (!payload) {
        console.error('Payload is undefined or invalid');
        return NextResponse.redirect(new URL('/login', req.url)); // Token not valid or payload empty
      }

      // Allow the request to proceed if the token is valid
      return NextResponse.next();
    } catch (verifyError) {
      console.error('JWT Verification error:', verifyError);
      return NextResponse.redirect(new URL('/login', req.url)); // JWT verification failed
    }

  } catch (err) {
    console.error('Authentication error:', err);
    return NextResponse.redirect(new URL('/login', req.url)); // On any error, redirect to login
  }
}

export const config = {
  matcher: ['/dashboard', '/organization/:path*', '/chatrooms/:path*'], // Updated to use `:path*` for route patterns
};
