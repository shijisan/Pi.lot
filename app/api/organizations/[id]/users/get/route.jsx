import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Fetch organization members with their user details and labels
    const members = await prisma.organizationUser.findMany({
      where: { organizationId: id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        label: true
      }
    });

    return NextResponse.json({ 
      members: members.map(member => ({
        id: member.id,
        user: member.user,
        role: member.role,
        label: member.label
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
