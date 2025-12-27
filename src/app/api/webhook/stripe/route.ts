import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Disable body parsing - we need raw body for signature verification
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const cartId = session.metadata?.cartId;
  const sessionId = session.metadata?.sessionId;

  if (!cartId) {
    console.error("No cartId in checkout session metadata");
    return;
  }

  // Get cart items
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    console.error("Cart not found or empty");
    return;
  }

  // Calculate totals
  const subtotalCents = cart.items.reduce((sum, item) => {
    return sum + (item.product?.priceCents || 0) * item.quantity;
  }, 0);

  const shippingCents = subtotalCents >= 7500 ? 0 : 800;
  const taxCents = 0; // Add tax calculation if needed
  const totalCents = subtotalCents + shippingCents + taxCents;

  // Generate order number
  const orderNumber = `BUCCI-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Get shipping address from Stripe session
  // Use type assertion for shipping details since it may not be in all API versions
  const shippingDetails = (session as { shipping_details?: { name?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string } } }).shipping_details;
  const customerDetails = session.customer_details;

  const shippingAddress = shippingDetails?.address
    ? {
        name: shippingDetails.name || "",
        line1: shippingDetails.address.line1 || "",
        line2: shippingDetails.address.line2 || "",
        city: shippingDetails.address.city || "",
        state: shippingDetails.address.state || "",
        postalCode: shippingDetails.address.postal_code || "",
        country: shippingDetails.address.country || "",
      }
    : {};

  const billingAddress = customerDetails?.address
    ? {
        name: customerDetails.name || "",
        line1: customerDetails.address.line1 || "",
        line2: customerDetails.address.line2 || "",
        city: customerDetails.address.city || "",
        state: customerDetails.address.state || "",
        postalCode: customerDetails.address.postal_code || "",
        country: customerDetails.address.country || "",
      }
    : shippingAddress;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      email: customerDetails?.email || session.customer_email || "",
      status: "CONFIRMED",
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      shippingAddress,
      billingAddress,
      stripePaymentIntentId: session.payment_intent as string,
      items: {
        create: cart.items
          .filter((item) => item.product)
          .map((item) => ({
            productId: item.productId,
            name: item.product!.name,
            sku: item.product!.sku,
            quantity: item.quantity,
            unitPriceCents: item.product!.priceCents,
            totalCents: item.product!.priceCents * item.quantity,
          })),
      },
    },
  });

  console.log(`Order created: ${order.orderNumber}`);

  // Clear the cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  console.log(`Cart cleared for session: ${sessionId}`);
}
