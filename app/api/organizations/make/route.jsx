import { checkAuth } from '@/utils/checkAuth'; // Import checkAuth utility
import prisma from '@/lib/prisma'; // Your Prisma client
import { NextResponse } from 'next/server';

export async function POST(req) {
  // Check if the user is authenticated
  const userId = await checkAuth();

  // If checkAuth returns an error, respond with that error
  if (userId instanceof NextResponse) {
    return userId; // Unauthorized error response if user is not authenticated
  }

  try {
    // Parse the request body to get the new organization name
    const { name } = await req.json();

    // Validate that the name is not empty
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Organization name is required.' }, { status: 400 });
    }

    // Create a new organization with the authenticated user as the owner
    const newOrganization = await prisma.organization.create({
      data: {
        name: name.trim(),
        ownerId: userId, // Set the current user as the owner
        userCount: 1, // Initial user count is 1 (the owner)
      },
    });

    // Add the authenticated user to the new organization as the first member
    await prisma.organizationUser.create({
      data: {
        userId: userId,
        organizationId: newOrganization.id,
        role: 'CREATOR', // The owner is the creator of the organization
      },
    });

    // Respond with the created organization data
    return NextResponse.json(newOrganization, { status: 201 });
  } catch (err) {
    console.error('Error creating organization:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
