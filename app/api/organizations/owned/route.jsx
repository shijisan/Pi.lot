import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    const userId = payload.sub; // Correctly accessing 'sub' instead of 'userId'

    const organizations = await prisma.organization.findMany({
      where: {
        OR: [
          { ownerId: userId }, 
          { users: { some: { userId } } } 
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            label: true
          }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error(error);
    if (error.name === "JWTVerificationError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
