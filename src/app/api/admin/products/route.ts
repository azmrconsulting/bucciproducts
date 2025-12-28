import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  compareAtPriceCents: z.number().int().min(0).nullable().optional(),
  costCents: z.number().int().min(0).nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  weightGrams: z.number().nullable().optional(),
  inventory: z.object({
    quantity: z.number().int().min(0),
    reservedQuantity: z.number().int().min(0).optional(),
    allowBackorder: z.boolean().optional(),
  }).optional(),
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
    const validatedData = productSchema.parse(body);

    // Check if SKU or slug already exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: validatedData.sku },
          { slug: validatedData.slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: existing.sku === validatedData.sku ? 'SKU already exists' : 'Slug already exists' },
        { status: 400 }
      );
    }

    const { inventory, ...productData } = validatedData;

    const product = await prisma.product.create({
      data: {
        ...productData,
        inventory: inventory ? {
          create: {
            quantity: inventory.quantity,
            reservedQuantity: inventory.reservedQuantity || 0,
            allowBackorder: inventory.allowBackorder || false,
          },
        } : undefined,
      },
      include: {
        inventory: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
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
