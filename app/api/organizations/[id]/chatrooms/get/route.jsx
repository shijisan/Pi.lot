import { checkAuth } from '@/utils/checkAuth';
import { supabase } from '@/lib/supabase'; // Assuming you have supabase client set up
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, context) {
  const userId = await checkAuth();

  if (userId instanceof NextResponse) {
    return userId; // Return error from checkAuth
  }

  console.log("Current User ID:", userId); // Debug: User ID

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ message: "Invalid organization ID" }, { status: 400 });
  }

  try {
    // Fetch the organizationId from Prisma (NeonTech DB)
    const organization = await prisma.organization.findUnique({
      where: { id: id },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    // Fetch chatrooms from Supabase
    const { data: chatrooms, error: chatroomError } = await supabase
      .from('chatrooms')
      .select('*')
      .eq('organization_id', organization.id);

    if (chatroomError) {
      console.error("Error fetching chatrooms from Supabase:", chatroomError);
      return NextResponse.json({ message: "Error fetching chatrooms from Supabase" }, { status: 500 });
    }

    console.log("Fetched Chatrooms:", chatrooms); // Debug: Chatrooms from Supabase

    // Fetch all labels in the organization using Prisma
    const labels = await prisma.userLabel.findMany({
      where: { organizationId: id },
    });

    console.log("Fetched Labels:", labels); // Debug: Labels from Prisma

    return NextResponse.json({ chatrooms, labels }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}
