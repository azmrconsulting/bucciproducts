import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotalCents } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Discount code is required" },
        { status: 400 }
      );
    }

    // Find the discount code (case-insensitive)
    const discountCode = await prisma.discountCode.findFirst({
      where: {
        code: {
          equals: code.toUpperCase(),
          mode: "insensitive",
        },
      },
    });

    if (!discountCode) {
      return NextResponse.json(
        { error: "Invalid discount code" },
        { status: 404 }
      );
    }

    // Check if active
    if (!discountCode.isActive) {
      return NextResponse.json(
        { error: "This discount code is no longer active" },
        { status: 400 }
      );
    }

    // Check start date
    if (discountCode.startsAt && new Date() < discountCode.startsAt) {
      return NextResponse.json(
        { error: "This discount code is not yet active" },
        { status: 400 }
      );
    }

    // Check expiration
    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      return NextResponse.json(
        { error: "This discount code has expired" },
        { status: 400 }
      );
    }

    // Check max uses
    if (discountCode.maxUses && discountCode.currentUses >= discountCode.maxUses) {
      return NextResponse.json(
        { error: "This discount code has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (discountCode.minimumOrderCents && subtotalCents < discountCode.minimumOrderCents) {
      const minOrder = (discountCode.minimumOrderCents / 100).toFixed(2);
      return NextResponse.json(
        { error: `Minimum order of $${minOrder} required for this code` },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmountCents = 0;
    let discountDescription = "";

    switch (discountCode.type) {
      case "PERCENTAGE":
        discountAmountCents = Math.round((subtotalCents * discountCode.value) / 100);
        discountDescription = `${discountCode.value}% off`;
        break;
      case "FIXED_AMOUNT":
        discountAmountCents = Math.min(discountCode.value, subtotalCents);
        discountDescription = `$${(discountCode.value / 100).toFixed(0)} off`;
        break;
      case "FREE_SHIPPING":
        discountAmountCents = 0; // Shipping handled separately
        discountDescription = "Free shipping";
        break;
    }

    return NextResponse.json({
      valid: true,
      discount: {
        id: discountCode.id,
        code: discountCode.code,
        type: discountCode.type,
        value: discountCode.value,
        discountAmountCents,
        description: discountDescription,
      },
    });
  } catch (error) {
    console.error("Discount validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate discount code" },
      { status: 500 }
    );
  }
}
