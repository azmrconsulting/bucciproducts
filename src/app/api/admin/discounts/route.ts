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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = discountCodeSchema.parse(body);

    // Check if code already exists
    const existing = await prisma.discountCode.findUnique({
      where: { code: validatedData.code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    const discountCode = await prisma.discountCode.create({
      data: {
        ...validatedData,
        startsAt: validatedData.startsAt ? new Date(validatedData.startsAt) : null,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      },
    });

    return NextResponse.json(discountCode);
  } catch (error) {
    console.error('Error creating discount code:', error);
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
