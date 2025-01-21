import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Supabase for fetching chatroom and messages
import prisma from "@/lib/prisma"; // Prisma for user full name
import { checkAuth } from "@/utils/checkAuth"; // Authentication utility

export async function GET(req, { params }) {
  const { id: chatroomId } = params; // Destructure the chatroom ID directly

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

    // Step 3: Fetch messages from Supabase and include sender's full name
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("id, sender, content, created_at")
      .eq("chatroom_id", chatroomId) // Supabase query to get messages for the specific chatroom
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Supabase error:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages from the chatroom." },
        { status: 500 }
      );
    }

    // Step 4: Fetch the full name of the sender from Prisma
    const messagesWithSenderFullName = await Promise.all(
      messages.map(async (message) => {
        const user = await prisma.user.findUnique({
          where: { id: message.sender },
          select: { fullName: true },
        });

        return {
          ...message,
          senderFullName: user ? user.fullName : "Unknown User",
        };
      })
    );

    // Step 5: Return the messages with the sender's full name
    return NextResponse.json({ messages: messagesWithSenderFullName });
  } catch (err) {
    console.error("Error fetching chatroom messages:", err);
    return NextResponse.json(
      { error: "An error occurred while fetching messages." },
      { status: 500 }
    );
  }
}
