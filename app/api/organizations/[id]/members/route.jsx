import { checkAuth } from "@/utils/checkAuth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Fix for /api/organization/
// member route
export async function GET(req, { params }) {
  const userId = await checkAuth();
  const organizationId = params.id;

  try {
    const members = await prisma.organizationUser.findMany({
      where: {
        organizationId: organizationId
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ members });
  } catch (err) {
    console.error('Error fetching organization members:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}