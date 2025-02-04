import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { userId, role, labelId } = await request.json();

    // Check if the user is already a member of the organization
    const existingMembership = await prisma.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id
        }
      }
    });

    if (existingMembership) {
      return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 400 });
    }

    // Create new organization user
    const newMember = await prisma.organizationUser.create({
      data: {
        userId,
        organizationId: id,
        role,
        labelId
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true
          }
        },
        label: true
      }
    });

    // Increment user count
    await prisma.organization.update({
      where: { id },
      data: { userCount: { increment: 1 } }
    });

    return NextResponse.json({ 
      member: {
        id: newMember.id,
        user: newMember.user,
        role: newMember.role,
        label: newMember.label
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding organization member:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}
