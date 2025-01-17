import { jwtVerify } from 'jose'; // Corrected import from 'jose'
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export const checkAuth = async () => {
  try {
    // Get the auth token from the cookies
    const cookieStore = await cookies(); // Explicitly await cookies retrieval
    const token = cookieStore.get('authToken'); // Get the token from cookies

    if (!token) {
      console.error('No valid token found');
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // Verify the token using the JWT_SECRET
    const { payload } = await jwtVerify(token.value, new TextEncoder().encode(JWT_SECRET)); // Ensure token is passed as a string (token.value)

    console.log('JWT Payload:', payload); // Log the payload for debugging

    if (!payload) {
      console.error('Payload is invalid');
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
    }

    // If verification is successful, return the userId or relevant data
    return payload.userId; // Assuming userId is part of the payload
  } catch (err) {
    console.error('Authentication error:', err);
    return NextResponse.json({ error: 'Authentication error.' }, { status: 500 });
  }
};
