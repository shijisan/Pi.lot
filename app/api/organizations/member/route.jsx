import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    // Log the token value for debugging
    console.log("Token from cookies:", token?.value);

    if (!token) {
      console.log("No token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    // Log the decoded JWT payload
    console.log("Decoded JWT payload:", payload);

    const userId = payload.sub;  // Accessing the 'sub' field, not 'userId'

    // Log the userId extracted from the token
    console.log("User ID from token:", userId);

    // Fetch organizations where the user is either the owner or a member
    const memberships = await prisma.organizationUser.findMany({
      where: {
        userId,
      },
      include: {
        organization: {
          include: {
            owner: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            _count: {
              select: { users: true },
            },
          },
        },
        label: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Log the fetched memberships to see if the query is correct
    console.log("Fetched memberships:", memberships);

    return NextResponse.json(memberships);
  } catch (error) {
    console.error("Error occurred:", error);

    if (error.name === "JWTVerificationError") {
      console.log("Invalid JWT token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    console.log("Unknown error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
