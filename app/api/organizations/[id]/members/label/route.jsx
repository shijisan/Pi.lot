import { NextResponse } from "next/server";
import { checkAuth } from "@/utils/checkAuth";
import prisma from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: organizationId } = params;
    
    // Safely parse the request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { memberId, label } = body;

    // Validate required fields
    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    if (typeof label !== "string") {
      return NextResponse.json(
        { error: "Label must be a string" },
        { status: 400 }
      );
    }

    // Check if member exists and belongs to the organization
    const existingMember = await prisma.organizationUser.findFirst({
      where: { id: memberId, organizationId },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Member not found in this organization" },
        { status: 404 }
      );
    }

    // Check if the label already exists in the organization
    let userLabel = await prisma.userLabel.findFirst({
      where: { name: label, organizationId },
    });

    // If the label doesn't exist, create a new one
    if (!userLabel) {
      userLabel = await prisma.userLabel.create({
        data: {
          name: label,
          organizationId,
        },
      });
    }

    // Update the member's userLabel relation
    const updatedMember = await prisma.organizationUser.update({
      where: { id: memberId },
      data: {
        userLabel: { connect: { id: userLabel.id } },
      },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
        userLabel: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
    
  } catch (error) {
    console.error("Error in PATCH /api/organizations/[id]/members/label:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the label" },
      { status: 500 }
    );
  }
}
