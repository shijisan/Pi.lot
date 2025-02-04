import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { userId } = await request.json();

    // Delete organization user
    await prisma.organizationUser.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id
        }
      }
    });

    // Decrement user count
    await prisma.organization.update({
      where: { id },
      data: { userCount: { decrement: 1 } }
    });

    return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error removing organization member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}