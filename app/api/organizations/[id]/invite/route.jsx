import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Assuming you have prisma set up
import { checkAuth } from "@/utils/checkAuth"; // Check if the current user is authenticated

export async function POST(req, { params }) {
  const { id: organizationId } = await params;
  
  try {
    // Step 1: Authenticate the user
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Parse request body for email input
    const { email, role } = await req.json();
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    // Step 3: Check if the email exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 4: Check if the user is already added to the organization
    const existingUserInOrganization = await prisma.organizationUser.findFirst({
      where: {
        userId: user.id,
        organizationId,
      },
    });

    if (existingUserInOrganization) {
      return NextResponse.json({ error: "User is already a member of this organization" }, { status: 400 });
    }

    // Step 5: Add the user to the organization
    const newOrgUser = await prisma.organizationUser.create({
      data: {
        userId: user.id,
        organizationId,
        role, // The role assigned to the user
      },
    });

    // Step 6: Update the user count of the organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: { userCount: { increment: 1 } },
    });

    return NextResponse.json({ message: "User added to the organization", organizationUser: newOrgUser }, { status: 200 });
  } catch (error) {
    console.error("Error adding user to organization:", error);
    return NextResponse.json({ error: "An error occurred while adding the user" }, { status: 500 });
  }
}
