import { checkAuth } from '@/utils/checkAuth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    // Call checkAuth to verify if the user is logged in
    const userId = await checkAuth();

    // If checkAuth returns an error response, return it early
    if (userId instanceof NextResponse) {
      return userId;
    }

    // Get the organization ID from the URL parameters - no need to await params
    const organizationId = await params.id;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Fetch the members of the organization
    const members = await prisma.organizationUser.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Return empty array if no members found
    if (!members) {
      return NextResponse.json({ members: [] }, { status: 200 });
    }

    // Return the members
    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    
    // Ensure we always return an object for the error response
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}