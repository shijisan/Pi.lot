import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Supabase client
import { checkAuth } from "@/utils/checkAuth"; // Auth utility
import prisma from "@/lib/prisma"; // Prisma client

export async function POST(req, { params }) {
  try {
    // Step 1: Authenticate the user and get the userId
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Get the organization ID from params
    const { id: organizationId } = params;

    // Step 3: Parse the request body to get the chatroom name
    const { name } = await req.json();

    // Step 4: Validate inputs
    if (!organizationId) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Chatroom name is required" }, { status: 400 });
    }

    // Step 5: Verify that the user belongs to the organization using Prisma
    const isMember = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!isMember) {
      return NextResponse.json({ error: "You are not authorized to create chatrooms in this organization" }, { status: 403 });
    }

    // Step 6: Create the chatroom in Supabase
    const { data: newChatroom, error } = await supabase
      .from("chatrooms")
      .insert([
        {
          name,
          organization_id: organizationId,
        },
      ])
      .single();

    if (error) {
      console.error("Error creating chatroom:", error);
      return NextResponse.json({ error: "Error creating chatroom in Supabase" }, { status: 500 });
    }

    // Step 7: Return the created chatroom
    return NextResponse.json({ chatroom: newChatroom }, { status: 201 });

  } catch (error) {
    console.error("Error creating chatroom:", error);
    return NextResponse.json({ error: "Error creating chatroom" }, { status: 500 });
  }
}
