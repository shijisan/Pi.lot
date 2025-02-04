import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { userId, role, labelId } = await request.json();

    // Update organization user
    const updatedMember = await prisma.organizationUser.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id
        }
      },
      data: {
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

    return NextResponse.json({ 
      member: {
        id: updatedMember.id,
        user: updatedMember.user,
        role: updatedMember.role,
        label: updatedMember.label
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating organization member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}
