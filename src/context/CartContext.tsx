"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  category: string | null;
}

export interface AppliedDiscount {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  discountAmountCents: number;
  description: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  isLoading: boolean;
  discount: AppliedDiscount | null;
  discountAmount: number;
  finalTotal: number;
  shippingCost: number;
  addToCart: (product: Omit<CartItem, "id" | "quantity">, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscount: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeDiscount: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);

  // Calculate totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate shipping (free over $75)
  const shippingCost = discount?.type === "FREE_SHIPPING" ? 0 : (totalPrice >= 75 ? 0 : 8);

  // Calculate discount amount
  const discountAmount = discount ? discount.discountAmountCents / 100 : 0;

  // Calculate final total
  const finalTotal = Math.max(0, totalPrice - discountAmount + shippingCost);

  // Load cart from API on mount
  useEffect(() => {
    fetchCart();
    // Load saved discount from sessionStorage
    const savedDiscount = sessionStorage.getItem("appliedDiscount");
    if (savedDiscount) {
      try {
        setDiscount(JSON.parse(savedDiscount));
      } catch {
        sessionStorage.removeItem("appliedDiscount");
      }
    }
  }, []);

  // Recalculate discount when cart changes
  useEffect(() => {
    if (discount && items.length > 0) {
      // Recalculate discount amount based on new subtotal
      const subtotalCents = Math.round(totalPrice * 100);
      let newDiscountAmountCents = 0;

      switch (discount.type) {
        case "PERCENTAGE":
          newDiscountAmountCents = Math.round((subtotalCents * discount.value) / 100);
          break;
        case "FIXED_AMOUNT":
          newDiscountAmountCents = Math.min(discount.value, subtotalCents);
          break;
        case "FREE_SHIPPING":
          newDiscountAmountCents = 0;
          break;
      }

      if (newDiscountAmountCents !== discount.discountAmountCents) {
        const updatedDiscount = { ...discount, discountAmountCents: newDiscountAmountCents };
        setDiscount(updatedDiscount);
        sessionStorage.setItem("appliedDiscount", JSON.stringify(updatedDiscount));
      }
    }
  }, [totalPrice, discount, items.length]);

  // Clear discount if cart is emptied
  useEffect(() => {
    if (items.length === 0 && discount) {
      setDiscount(null);
      sessionStorage.removeItem("appliedDiscount");
    }
  }, [items.length, discount]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = useCallback(
    async (product: Omit<CartItem, "id" | "quantity">, quantity = 1) => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.productId, quantity }),
        });

        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
      }
    },
    []
  );

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  }, []);

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) {
        return removeFromCart(itemId);
      }

      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, quantity }),
        });

        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
      }
    },
    [removeFromCart]
  );

  const clearCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
      });

      if (res.ok) {
        setItems([]);
        setDiscount(null);
        sessionStorage.removeItem("appliedDiscount");
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, []);

  const applyDiscount = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const subtotalCents = Math.round(totalPrice * 100);
        const res = await fetch("/api/discount/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subtotalCents }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error };
        }

        const appliedDiscount: AppliedDiscount = data.discount;
        setDiscount(appliedDiscount);
        sessionStorage.setItem("appliedDiscount", JSON.stringify(appliedDiscount));

        return { success: true };
      } catch (error) {
        console.error("Failed to apply discount:", error);
        return { success: false, error: "Failed to apply discount code" };
      }
    },
    [totalPrice]
  );

  const removeDiscount = useCallback(() => {
    setDiscount(null);
    sessionStorage.removeItem("appliedDiscount");
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        isLoading,
        discount,
        discountAmount,
        finalTotal,
        shippingCost,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyDiscount,
        removeDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
