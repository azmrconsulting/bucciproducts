import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

// Helper to get or create cart
async function getOrCreateCart() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cart_session")?.value;

  if (!sessionId) {
    sessionId = uuidv4();
  }

  let cart = await prisma.cart.findFirst({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  return { cart, sessionId };
}

// Format cart items for response
function formatCartItems(cart: Awaited<ReturnType<typeof getOrCreateCart>>["cart"]) {
  return cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product?.name || "Unknown",
    slug: item.product?.slug || "",
    price: item.product ? item.product.priceCents / 100 : 0,
    quantity: item.quantity,
    category: item.product?.category || null,
  }));
}

// GET - Fetch cart
export async function GET() {
  try {
    const { cart, sessionId } = await getOrCreateCart();

    const response = NextResponse.json({
      items: formatCartItems(cart),
    });

    // SECURITY: Strict cookie settings to prevent session hijacking
    response.cookies.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // SECURITY: Strict to prevent CSRF attacks
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // SECURITY: Validate quantity to prevent manipulation
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 100" },
        { status: 400 }
      );
    }

    const { cart, sessionId } = await getOrCreateCart();

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if item already in cart
    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      // Update quantity (cap at 100)
      const newQuantity = Math.min(existingItem.quantity + parsedQuantity, 100);
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: parsedQuantity,
        },
      });
    }

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const response = NextResponse.json({
      items: formatCartItems(updatedCart!),
    });

    response.cookies.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

// PATCH - Update item quantity
export async function PATCH(request: NextRequest) {
  try {
    const { itemId, quantity } = await request.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: "Item ID and quantity are required" },
        { status: 400 }
      );
    }

    // SECURITY: Validate quantity
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0 || parsedQuantity > 100) {
      return NextResponse.json(
        { error: "Quantity must be between 0 and 100" },
        { status: 400 }
      );
    }

    const { cart, sessionId } = await getOrCreateCart();

    // Verify item belongs to this cart
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    if (parsedQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: parsedQuantity },
      });
    }

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const response = NextResponse.json({
      items: formatCartItems(updatedCart!),
    });

    response.cookies.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("PATCH /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const { cart, sessionId } = await getOrCreateCart();

    // Verify item belongs to this cart
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    // Fetch updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const response = NextResponse.json({
      items: formatCartItems(updatedCart!),
    });

    response.cookies.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
