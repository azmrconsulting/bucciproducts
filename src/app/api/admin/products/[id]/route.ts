import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  priceCents: z.number().int().min(0),
  compareAtPriceCents: z.number().int().min(0).nullable().optional(),
  costCents: z.number().int().min(0).nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  weightGrams: z.number().nullable().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  inventory: z.object({
    quantity: z.number().int().min(0),
    reservedQuantity: z.number().int().min(0).optional(),
    allowBackorder: z.boolean().optional(),
  }).optional(),
});

export async function PUT(
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

    const product = await prisma.product.findUnique({
      where: { id: id },
      include: { inventory: true, images: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if SKU or slug conflicts with another product
    const existing = await prisma.product.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { sku: validatedData.sku },
              { slug: validatedData.slug },
            ],
          },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: existing.sku === validatedData.sku ? 'SKU already exists' : 'Slug already exists' },
        { status: 400 }
      );
    }

    const { inventory, imageUrl, ...productData } = validatedData;

    // Update product and inventory
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: productData,
      include: { inventory: true, images: true },
    });

    // Handle image update
    if (imageUrl !== undefined) {
      // Delete existing images and create new one if URL provided
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (imageUrl) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: imageUrl,
            altText: productData.name,
            position: 0,
            isPrimary: true,
          },
        });
      }
    }

    // Update or create inventory
    if (inventory) {
      if (product.inventory) {
        await prisma.inventory.update({
          where: { id: product.inventory.id },
          data: {
            quantity: inventory.quantity,
            reservedQuantity: inventory.reservedQuantity || 0,
            allowBackorder: inventory.allowBackorder || false,
          },
        });
      } else {
        await prisma.inventory.create({
          data: {
            productId: id,
            quantity: inventory.quantity,
            reservedQuantity: inventory.reservedQuantity || 0,
            allowBackorder: inventory.allowBackorder || false,
          },
        });
      }
    }

    // Fetch updated product with inventory and images
    const finalProduct = await prisma.product.findUnique({
      where: { id: id },
      include: { inventory: true, images: true },
    });

    return NextResponse.json(finalProduct);
  } catch (error) {
    console.error('Error updating product:', error);
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

    const { id } = await params;

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is used in any orders
    const ordersWithProduct = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (ordersWithProduct > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered. Consider marking it as inactive instead.' },
        { status: 400 }
      );
    }

    // Delete related records first
    await prisma.$transaction([
      prisma.inventory.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id: id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
