import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "No cart found" }, { status: 400 });
    }

    // Get cart with items
    const cart = await prisma.cart.findFirst({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // SECURITY: Validate cart items before checkout
    for (const item of cart.items) {
      // Validate quantity is positive and reasonable
      if (item.quantity <= 0 || item.quantity > 100) {
        return NextResponse.json(
          { error: "Invalid item quantity" },
          { status: 400 }
        );
      }

      // Verify product exists and is active
      if (!item.product) {
        return NextResponse.json(
          { error: "One or more products not found" },
          { status: 400 }
        );
      }

      if (!item.product.isActive) {
        return NextResponse.json(
          { error: `${item.product.name} is no longer available` },
          { status: 400 }
        );
      }

      // Check inventory availability
      const inventory = await prisma.inventory.findFirst({
        where: { productId: item.productId },
      });

      if (inventory && !inventory.allowBackorder) {
        const availableQuantity = inventory.quantity - inventory.reservedQuantity;
        if (item.quantity > availableQuantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.product.name}. Only ${availableQuantity} available.` },
            { status: 400 }
          );
        }
      }
    }

    // Get request body
    const body = await request.json().catch(() => ({}));
    const customerEmail = body.email;
    const discountCode = body.discountCode;

    // Calculate subtotal
    const subtotalCents = cart.items.reduce((sum, item) => {
      return sum + (item.product?.priceCents || 0) * item.quantity;
    }, 0);

    // Validate discount code if provided
    let validDiscount: {
      id: string;
      code: string;
      type: string;
      value: number;
      discountAmountCents: number;
    } | null = null;

    if (discountCode) {
      const discount = await prisma.discountCode.findFirst({
        where: {
          code: {
            equals: discountCode.toUpperCase(),
            mode: "insensitive",
          },
        },
      });

      if (discount && discount.isActive) {
        // Validate all conditions
        const now = new Date();
        const isValid =
          (!discount.startsAt || now >= discount.startsAt) &&
          (!discount.expiresAt || now <= discount.expiresAt) &&
          (!discount.maxUses || discount.currentUses < discount.maxUses) &&
          (!discount.minimumOrderCents || subtotalCents >= discount.minimumOrderCents);

        if (isValid) {
          let discountAmountCents = 0;
          switch (discount.type) {
            case "PERCENTAGE":
              discountAmountCents = Math.round((subtotalCents * discount.value) / 100);
              break;
            case "FIXED_AMOUNT":
              discountAmountCents = Math.min(discount.value, subtotalCents);
              break;
            case "FREE_SHIPPING":
              discountAmountCents = 0;
              break;
          }

          validDiscount = {
            id: discount.id,
            code: discount.code,
            type: discount.type,
            value: discount.value,
            discountAmountCents,
          };
        }
      }
    }

    // Calculate shipping
    const freeShipping = validDiscount?.type === "FREE_SHIPPING" || subtotalCents >= 7500;
    const shippingCents = freeShipping ? 0 : 800;

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items
      .filter((item) => item.product)
      .map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product!.name,
            description: item.product!.shortDescription || undefined,
          },
          unit_amount: item.product!.priceCents,
        },
        quantity: item.quantity,
      }));

    // Add shipping as a line item if applicable
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            description: "Standard shipping",
          },
          unit_amount: shippingCents,
        },
        quantity: 1,
      });
    }

    // Prepare checkout session params
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: customerEmail || undefined,
      metadata: {
        cartId: cart.id,
        sessionId: sessionId,
        discountCodeId: validDiscount?.id || "",
        discountCode: validDiscount?.code || "",
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      billing_address_collection: "required",
    };

    // Apply discount using Stripe coupons
    if (validDiscount && validDiscount.discountAmountCents > 0) {
      // Create a one-time coupon in Stripe
      const coupon = await stripe.coupons.create({
        amount_off: validDiscount.discountAmountCents,
        currency: "usd",
        duration: "once",
        name: `Discount: ${validDiscount.code}`,
      });

      checkoutParams.discounts = [{ coupon: coupon.id }];
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
