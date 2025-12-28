import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const discountCodeSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.number().int().min(0),
  minimumOrderCents: z.number().int().min(0).nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const discountCode = await prisma.discountCode.findUnique({
      where: { id },
    });

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = discountCodeSchema.parse(body);

    // Check if code conflicts with another discount code
    const existing = await prisma.discountCode.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { code: validatedData.code },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    const updatedDiscountCode = await prisma.discountCode.update({
      where: { id },
      data: {
        ...validatedData,
        startsAt: validatedData.startsAt ? new Date(validatedData.startsAt) : null,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      },
    });

    return NextResponse.json(updatedDiscountCode);
  } catch (error) {
    console.error('Error updating discount code:', error);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const discountCode = await prisma.discountCode.findUnique({
      where: { id },
    });

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    // Check if discount code is used in any orders
    const ordersWithCode = await prisma.order.count({
      where: { discountCodeId: id },
    });

    if (ordersWithCode > 0) {
      return NextResponse.json(
        { error: 'Cannot delete discount code that has been used in orders. Consider marking it as inactive instead.' },
        { status: 400 }
      );
    }

    await prisma.discountCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
