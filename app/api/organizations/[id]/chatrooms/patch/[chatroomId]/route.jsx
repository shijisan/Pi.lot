import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Keep Prisma for user and organization checks
import { supabase } from '@/lib/supabase'; // Supabase for chatroom and messages
import { checkAuth } from '@/utils/checkAuth'; // Assumes an authentication utility for user validation

export async function PATCH(request, { params }) {
  try {
    // Authenticate the user and get the userId
    const userId = await checkAuth();
    if (userId instanceof NextResponse) {
      return userId; // Return if unauthenticated
    }

    // Await params before destructuring
    const { id: orgId, chatroomId } = await params; // Await params here

    // Log the extracted values for debugging
    console.log("userId", userId);
    console.log("orgId", orgId);
    console.log("chatroomId", chatroomId);

    // Validate if chatroomId exists
    if (!chatroomId) {
      return NextResponse.json(
        { error: 'Chatroom ID is required' },
        { status: 400 }
      );
    }

    // Validate if orgId exists (as a string UUID)
    if (!orgId) {
      return NextResponse.json(
        { error: 'Invalid Organization ID' },
        { status: 400 }
      );
    }

    // Fetch the user's role from the organization (using Prisma)
    const user = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId: userId, // The user requesting the update
          organizationId: orgId, // Use orgId as a string (UUID)
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User does not belong to this organization' },
        { status: 403 }
      );
    }

    // Fetch the role from the user record in the organization
    const userRole = user.role;

    console.log("userRole", userRole);

    // Check the user's role (CREATOR or MODERATOR)
    if (![ 'CREATOR', 'MODERATOR' ].includes(userRole)) {
      return NextResponse.json(
        { error: 'User does not have permission to edit chatrooms' },
        { status: 403 }
      );
    }

    // Check if the chatroom exists and belongs to the correct organization (using Supabase)
    const { data: chatroom, error: chatroomError } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('id', chatroomId)
      .single(); // Fetch a single chatroom

    if (chatroomError || !chatroom) {
      return NextResponse.json(
        { error: 'Chatroom not found' },
        { status: 404 }
      );
    }

    if (chatroom.organization_id !== orgId) {
      return NextResponse.json(
        { error: 'Chatroom does not belong to this organization' },
        { status: 403 }
      );
    }

    // Parse the request body to get the new name
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Chatroom name is required' },
        { status: 400 }
      );
    }

    // Update the chatroom (using Supabase)
    const { data: updatedChatroom, error: updateError } = await supabase
      .from('chatrooms')
      .update({ name })
      .eq('id', chatroomId)
      .single(); // Update and fetch the updated chatroom

    if (updateError) {
      return NextResponse.json(
        { error: 'Error updating chatroom' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Chatroom updated successfully', chatroom: updatedChatroom });
  } catch (error) {
    console.error('Error updating chatroom:', error);

    // Ensure the error object is properly handled
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
