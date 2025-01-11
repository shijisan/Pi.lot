import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET(req, { params }) {
    const { id } = params;

    try {
        // Get token from cookies
        const cookieStore = cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify token and get userId
        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );
        const userId = payload.userId;

        // Fetch organization with all related data
        const organization = await prisma.organization.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                owner: true,
                users: {
                    include: {
                        user: true,
                        label: true,
                    },
                },
            },
        });

        if (!organization) {
            return NextResponse.json({ error: "Organization not found." }, { status: 404 });
        }

        // Check if user is owner or member
        const isOwner = organization.owner.id === userId;
        const isMember = organization.users.some(user => user.user.id === userId);

        if (!isOwner && !isMember) {
            return NextResponse.json({ error: "Unauthorized access to organization." }, { status: 401 });
        }

        return NextResponse.json(organization, { status: 200 });
    } catch (error) {
        console.error("Error fetching organization:", error);
        if (error.name === 'JWTVerificationError') {
            return NextResponse.json({ error: "Invalid token." }, { status: 401 });
        }
        return NextResponse.json({ error: "An error occurred while fetching the organization." }, { status: 500 });
    }
}