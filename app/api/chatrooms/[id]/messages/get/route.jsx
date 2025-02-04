import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Supabase for fetching chatroom
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

    // Step 3: Return the chatroom details
    return NextResponse.json({ chatroom });
  } catch (err) {
    console.error("Error fetching chatroom:", err);
    return NextResponse.json(
      { error: "An error occurred while fetching the chatroom." },
      { status: 500 }
    );
  }
}