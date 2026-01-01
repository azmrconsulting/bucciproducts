import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";
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
  // Retrieve the full session from Stripe to get all details
  // The webhook event doesn't include all data by default
  const fullSession = await stripe.checkout.sessions.retrieve(session.id);

  const cartId = fullSession.metadata?.cartId;
  const sessionId = fullSession.metadata?.sessionId;
  const discountCodeId = fullSession.metadata?.discountCodeId;

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

  // Get discount amount from Stripe session if applied
  let discountCents = 0;
  if (fullSession.total_details?.amount_discount) {
    discountCents = fullSession.total_details.amount_discount;
  }

  const shippingCents = subtotalCents >= 7500 ? 0 : 800;
  const taxCents = 0; // Add tax calculation if needed
  const totalCents = fullSession.amount_total || (subtotalCents - discountCents + shippingCents + taxCents);

  // Generate order number
  const orderNumber = `BUCCI-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Get shipping address from the full session (expanded data)
  // Use type assertion since shipping_details is not in all Stripe type definitions
  const shippingDetails = (fullSession as unknown as {
    shipping_details?: {
      name?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    };
  }).shipping_details;
  const customerDetails = fullSession.customer_details;

  // Debug logging to see what Stripe is returning
  console.log('=== STRIPE SESSION DEBUG ===');
  console.log('Full session shipping_details:', JSON.stringify(shippingDetails, null, 2));
  console.log('Full session customer_details:', JSON.stringify(customerDetails, null, 2));
  console.log('Full session keys:', Object.keys(fullSession));
  console.log('============================');

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

  console.log('Constructed shippingAddress:', JSON.stringify(shippingAddress, null, 2));
  console.log('Constructed billingAddress:', JSON.stringify(billingAddress, null, 2));

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
      stripePaymentIntentId: fullSession.payment_intent as string,
      discountCodeId: discountCodeId || null,
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
    include: {
      items: true,
    },
  });

  console.log(`Order created: ${order.orderNumber}`);

  // Update discount code usage count if used
  if (discountCodeId) {
    await prisma.discountCode.update({
      where: { id: discountCodeId },
      data: { currentUses: { increment: 1 } },
    });
    console.log(`Discount code usage incremented: ${discountCodeId}`);
  }

  // Prepare email data
  const emailData = {
    orderNumber: order.orderNumber,
    email: order.email,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      totalCents: item.totalCents,
    })),
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    discountCents: discountCents > 0 ? discountCents : undefined,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    shippingAddress: shippingAddress as {
      name?: string;
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    },
  };

  // Send confirmation email to customer
  try {
    const customerEmailResult = await sendOrderConfirmationEmail(emailData);
    if (customerEmailResult.success) {
      console.log(`Order confirmation email sent to ${order.email}`);
    } else {
      console.error(`Failed to send confirmation email:`, customerEmailResult.error);
    }
  } catch (error) {
    console.error(`Error sending confirmation email:`, error);
  }

  // Send notification to admin
  try {
    const adminEmailResult = await sendAdminOrderNotification(emailData);
    if (adminEmailResult.success) {
      console.log(`Admin notification email sent`);
    } else {
      console.error(`Failed to send admin notification:`, adminEmailResult.error);
    }
  } catch (error) {
    console.error(`Error sending admin notification:`, error);
  }

  // Clear the cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  console.log(`Cart cleared for session: ${sessionId}`);
}
