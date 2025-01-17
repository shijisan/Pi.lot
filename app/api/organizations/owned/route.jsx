import { checkAuth } from '@/utils/checkAuth'; // Import checkAuth utility
import prisma from '@/lib/prisma'; // Your Prisma client
import { NextResponse } from 'next/server';

export async function GET(req) {
  // Call checkAuth to verify if the user is logged in and get their userId
  const userId = await checkAuth();

  // If checkAuth returns an error response, return it early
  if (userId instanceof NextResponse) {
    return userId; // Return the error response from checkAuth
  }

  try {
    // Fetch organizations where the current user is the owner
    const ownedOrganizations = await prisma.organization.findMany({
      where: {
        ownerId: userId, // Filter by ownerId matching the authenticated user's ID
      },
      include: {
        users: true, // Include users in each organization (can be modified based on your needs)
      },
    });

    // Return the organizations the user owns
    console.log(ownedOrganizations);
    return NextResponse.json({ ownedOrganizations }, { status: 200 });
  } catch (err) {
    console.error('Error fetching owned organizations:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
