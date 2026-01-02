import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, getRateLimitHeaders } from "@/lib/rate-limit";

// SECURITY: Rate limit discount validation to prevent brute-forcing codes
const discountRateLimit = { interval: 60 * 1000, maxRequests: 10 }; // 10 attempts per minute

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limit discount code attempts
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`discount:${clientIp}`, discountRateLimit);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, discountRateLimit.maxRequests),
        }
      );
    }

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

    // SECURITY: Use generic error to prevent code enumeration
    // Don't reveal whether code exists, is inactive, expired, etc.
    if (!discountCode || !discountCode.isActive) {
      return NextResponse.json(
        { error: "Invalid or expired discount code" },
        { status: 400 }
      );
    }

    // Check start date
    if (discountCode.startsAt && new Date() < discountCode.startsAt) {
      return NextResponse.json(
        { error: "Invalid or expired discount code" },
        { status: 400 }
      );
    }

    // Check expiration
    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      return NextResponse.json(
        { error: "Invalid or expired discount code" },
        { status: 400 }
      );
    }

    // Check max uses
    if (discountCode.maxUses && discountCode.currentUses >= discountCode.maxUses) {
      return NextResponse.json(
        { error: "Invalid or expired discount code" },
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
