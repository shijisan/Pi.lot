import { checkAuth } from '@/utils/checkAuth';
import { supabase } from '@/lib/supabase'; // Make sure you have the correct Supabase client import
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const userId = await checkAuth();

  if (userId instanceof NextResponse) {
    return userId; // Return error from checkAuth
  }

  const { id } = await params; // Ensure the `id` is used as a string (UUID)

  if (!id) {
    return NextResponse.json({ message: "Invalid organization ID" }, { status: 400 });
  }

  console.log("Fetching chatrooms for organization ID:", id);

  try {
    // Query chatrooms from Supabase for the given organizationId
    const { data: chatrooms, error } = await supabase
      .from('chatrooms') // Use the correct table name in Supabase
      .select('*')
      .eq('organization_id', id); // Assuming the column is named `organization_id` in Supabase

    if (error) {
      console.error("Error fetching chatrooms from Supabase:", error);
      return NextResponse.json({ message: "Error fetching chatrooms from Supabase" }, { status: 500 });
    }

    console.log("Chatrooms fetched:", chatrooms);

    if (!chatrooms || chatrooms.length === 0) {
      // Return 200 status with a friendly message for no chatrooms
      return NextResponse.json(
        { message: "No chatrooms found. You might need an invite to join one.", chatrooms: [] },
        { status: 200 }
      );
    }

    return NextResponse.json({ chatrooms }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chatrooms:", error);
    return NextResponse.json({ message: "Error fetching chatrooms" }, { status: 500 });
  }
}
