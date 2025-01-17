import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Supabase for fetching messages and chatroom
import { checkAuth } from "@/utils/checkAuth"; // Assumes an authentication utility for user validation

export async function POST(req, { params }) {
  try {
    // Step 1: Authenticate the user and get the userId
    const userId = await checkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Get chatroom ID from params
    const { id: chatroomId } = await params;

    // Step 3: Parse the request body to get the message content
    const { content } = await req.json();
    if (!content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Step 4: Ensure the chatroom exists in Supabase
    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .select("*")
      .eq("id", chatroomId)
      .single();

    if (chatroomError || !chatroom) {
      console.error("Error checking chatroom in Supabase:", chatroomError);
      return NextResponse.json({ error: "Chatroom not found" }, { status: 404 });
    }

    console.log(`Chatroom found in Supabase:`, chatroom);

    // Step 5: Create a new message in Supabase for real-time functionality
    const { data: supabaseMessage, error: supabaseError } = await supabase
      .from("messages")
      .insert([{ content, sender: userId, chatroom_id: chatroomId, created_at: new Date() }])
      .select(); // Ensure we get the inserted message data

    if (supabaseError) {
      console.error("Error sending message to Supabase:", supabaseError);
      return NextResponse.json({ error: "Error sending message to Supabase" }, { status: 500 });
    }

    // Check if the message was inserted and returned
    if (!supabaseMessage || supabaseMessage.length === 0) {
      return NextResponse.json({ error: "Message creation failed." }, { status: 500 });
    }

    console.log("Message sent to Supabase:", supabaseMessage);

    // Step 6: Return the created message from Supabase
    return NextResponse.json({ message: supabaseMessage[0] }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "An error occurred while sending the message." },
      { status: 500 }
    );
  }
}
