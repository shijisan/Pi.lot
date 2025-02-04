import { checkAuth } from '@/utils/checkAuth'; // Import checkAuth utility
import prisma from '@/lib/prisma'; // Your Prisma client
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  // Call checkAuth to verify if the user is logged in
  const userId = await checkAuth();

  // If checkAuth returns an error response, return it early
  if (userId instanceof NextResponse) {
    return userId; // Return the error response from checkAuth
  }

  const { id } = await params; // Ensure params are awaited

  console.log("userId", userId);
  console.log("id", id);

  try {
    // Fetch the organization from the database
    const organization = await prisma.organization.findUnique({
      where: { id: id }, // Ensure ID is parsed to an integer
      include: {
        owner: true, // Include owner details
        users: {
          where: {
            userId: userId, // Ensure the user is part of the organization
          },
          include: {
            user: true, // Include user details
          },
        },
      },
    });

    if (!organization) {
      console.error("Organization not found:", id); // Log when organization is not found
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    // Fetch the members of the organization to include in the response
    const members = organization.users.map((orgUser) => ({
      id: orgUser.user.id,
      fullName: orgUser.user.fullName,
      role: orgUser.role,
    }));

    // Return the organization data and members in the correct structure
    return NextResponse.json(
      {
        organization: {
          ...organization,
          members,
        },
        currentUserRole: organization.users.find((orgUser) => orgUser.userId === userId)?.role || "DEFAULT",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching organization:", error); // Log detailed error
    return NextResponse.json({ message: "Error fetching organization" }, { status: 500 });
  }
}
