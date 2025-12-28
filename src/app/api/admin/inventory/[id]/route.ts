import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateInventorySchema = z.object({
  quantity: z.number().int().min(0),
  reservedQuantity: z.number().int().min(0).optional(),
  allowBackorder: z.boolean().optional(),
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
    const validatedData = updateInventorySchema.parse(body);

    const inventory = await prisma.inventory.findUnique({
      where: { id: id },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      );
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id: id },
      data: validatedData,
    });

    return NextResponse.json(updatedInventory);
  } catch (error) {
    console.error('Error updating inventory:', error);
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
