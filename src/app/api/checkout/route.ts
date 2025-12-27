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

    // Get email from request body (optional)
    const body = await request.json().catch(() => ({}));
    const customerEmail = body.email;

    // Calculate totals
    const subtotalCents = cart.items.reduce((sum, item) => {
      return sum + (item.product?.priceCents || 0) * item.quantity;
    }, 0);

    const shippingCents = subtotalCents >= 7500 ? 0 : 800; // Free shipping over $75

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

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: customerEmail || undefined,
      metadata: {
        cartId: cart.id,
        sessionId: sessionId,
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      billing_address_collection: "required",
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
