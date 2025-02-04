import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/utils/checkAuth";
import prisma from "@/lib/prisma";

export async function POST(req, context) {
  try {
    // Step 1: Authenticate the user
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Extract organization ID from params
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    // Step 3: Parse the request body
    const body = await req.json();
    const { name, description, labelAccess } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Chatroom name is required" }, { status: 400 });
    }

    if (!Array.isArray(labelAccess) || labelAccess.length === 0) {
      return NextResponse.json({ error: "Label access configuration is required" }, { status: 400 });
    }

    // Step 4: Verify user's organization membership
    const orgMember = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id,
        },
      },
    });

    if (!orgMember) {
      return NextResponse.json(
        { error: "Not authorized to create chatrooms in this organization" },
        { status: 403 }
      );
    }

    // Step 5: Create chatroom using Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the chatroom first
      const chatroom = await tx.chatroom.create({
        data: {
          name,
          description,
          organizationId: id,
        },
      });

      // Create chatroom access entries
      await tx.chatroomAccess.createMany({
        data: labelAccess.map(({ labelId, canRead, canWrite }) => ({
          chatroomId: chatroom.id,
          labelId,
          canRead: Boolean(canRead),
          canWrite: Boolean(canWrite),
        })),
      });

      return chatroom;
    });

    return NextResponse.json({ chatroom: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating chatroom:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create chatroom" },
      { status: 500 }
    );
  }
}