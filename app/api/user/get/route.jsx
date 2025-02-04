// app/api/user/get/route.jsx
import { checkAuth } from '@/utils/checkAuth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const GET = async (request) => {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User does not exist.' }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.id,
      fullName: user.fullName
    });
  } catch (err) {
    console.error('Authentication error:', err);
    return NextResponse.json({ error: 'Authentication error.' }, { status: 500 });
  }
};