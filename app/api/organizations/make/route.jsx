import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Authentication token is missing." }, { status: 401 });
        }

        let decodedToken;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            decodedToken = payload;
        } catch (err) {
            console.error("JWT verification failed:", err);
            return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
        }

        const userId = decodedToken.sub;

        const body = await req.json();
        const { name } = body;

        if (!name || name.trim() === "") {
            return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
        }

        const newOrganization = await prisma.organization.create({
            data: {
                name,
                ownerId: parseInt(userId, 10),
                users: {
                    create: {
                        userId: parseInt(userId, 10),
                        role: "CREATOR",
                    },
                },
                userCount: 1,
            },
            include: {
                users: true,
                owner: true, 
            },
        });
        

        return NextResponse.json(newOrganization, { status: 201 });
    } catch (error) {
        console.error("Error creating organization:", error);
        return NextResponse.json({ error: "An error occurred while creating the organization." }, { status: 500 });
    }
}