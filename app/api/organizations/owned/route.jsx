import { checkAuth } from '@/utils/checkAuth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const userId = await checkAuth();

  if (userId instanceof NextResponse) {
    return userId;
  }

  try {
    const ownedOrganizations = await prisma.organization.findMany({
      where: {
        ownerId: userId
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ ownedOrganizations });
  } catch (err) {
    console.error('Error fetching owned organizations:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}