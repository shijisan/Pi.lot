import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma for user and organization checks
import { supabase } from "@/lib/supabase"; // Supabase for fetching chatroom and messages
import { checkAuth } from "@/utils/checkAuth"; // Authentication utility

export async function GET(req, { params }) {
  const { id: chatroomId } = await params; // Destructure the chatroom ID directly

  // Step 1: Check authentication
  const userId = await checkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2: Fetch the chatroom from Supabase
  try {
    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .select("id, name, organization_id")
      .eq("id", chatroomId)
      .single(); // Ensure it fetches a single chatroom

    if (chatroomError || !chatroom) {
      return NextResponse.json(
        { error: "Chatroom not found." },
        { status: 404 }
      );
    }

    // Step 3: Validate that the user is part of the organization the chatroom belongs to
    const userOrganization = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: userId, // The user requesting access
          organizationId: chatroom.organization_id, // The organization the chatroom belongs to
        },
      },
    });

    if (!userOrganization) {
      return NextResponse.json(
        { error: "You do not have access to this chatroom." },
        { status: 403 }
      );
    }

    // Step 4: Fetch real-time messages from Supabase
    const { data: messages, error } = await supabase
      .from("messages")
      .select("id, sender, content, created_at")
      .eq("chatroom_id", chatroomId) // Supabase query to get messages for the specific chatroom
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages from the chatroom." },
        { status: 500 }
      );
    }

    // Step 5: Return the messages in JSON format
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("Error fetching chatroom messages:", err);
    return NextResponse.json(
      { error: "An error occurred while fetching messages." },
      { status: 500 }
    );
  }
}
