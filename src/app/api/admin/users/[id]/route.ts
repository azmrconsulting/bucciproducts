import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['CUSTOMER', 'ADMIN']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const { id } = await params;

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // SECURITY: Prevent self-demotion
    if (targetUser.id === session.user.id && validatedData.role === 'CUSTOMER') {
      return NextResponse.json(
        { error: 'You cannot demote yourself. Ask another admin.' },
        { status: 403 }
      );
    }

    // SECURITY: Audit log for role changes
    console.log(`[AUDIT] Admin ${session.user.email} changed ${targetUser.email} role from ${targetUser.role} to ${validatedData.role} at ${new Date().toISOString()}`);

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { role: validatedData.role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
