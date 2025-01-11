import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req, { params }) {
    const { id } = params;

    try {
        const organization = await prisma.organization.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                owner: true, // Include the owner of the organization
                users: {
                    include: {
                        user: true, // Include user information
                        label: true, // Include user label if it exists
                    },
                },
            },
        });

        if (!organization) {
            return NextResponse.json({ error: "Organization not found." }, { status: 404 });
        }

        return NextResponse.json(organization, { status: 200 });
    } catch (error) {
        console.error("Error fetching organization:", error);
        return NextResponse.json({ error: "An error occurred while fetching the organization." }, { status: 500 });
    }
}
