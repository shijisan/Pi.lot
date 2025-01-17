// app/api/user/get/route.jsx
import { checkAuth } from '@/lib/auth'; // Assuming this is the location of your checkAuth function
import { NextResponse } from 'next/server';

export const GET = async (request) => {
  try {
    const userId = await checkAuth(); // Get the user ID from the JWT token
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    return NextResponse.json({ userId });
  } catch (err) {
    console.error('Authentication error:', err);
    return NextResponse.json({ error: 'Authentication error.' }, { status: 500 });
  }
};
