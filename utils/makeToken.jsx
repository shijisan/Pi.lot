import { SignJWT } from 'jose';
import { TextEncoder } from 'util';

const JWT_SECRET = process.env.JWT_SECRET; // Your secret key

export async function createToken(userId) {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    // Create a JWT with userId, set issued and expiration time, set header, then sign it
    const token = await new SignJWT({ userId })
      .setIssuedAt() // Set the "iat" (issued at) claim
      .setExpirationTime('1h') // Set expiration time (e.g., 1 hour)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' }) // Set protected header (algorithm and type)
      .sign(new TextEncoder().encode(JWT_SECRET)); // Sign the token with the secret key

    return token;
  } catch (err) {
    console.error('Error creating token:', err);
    throw new Error('Failed to create token');
  }
}
