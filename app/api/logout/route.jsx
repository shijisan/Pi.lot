import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out successfully' });

  res.cookies.set('authToken', '', { httpOnly: true, maxAge: 0, path: '/' });

  return res;
}
