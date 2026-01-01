"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2, ShoppingBag, Tag, X, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Determine bottle type based on category for visual display
function getBottleType(category: string | null): "serum" | "tall" | "wide" {
  switch (category) {
    case "oils":
      return "serum";
    case "shampoo":
    case "conditioner":
      return "tall";
    case "styling":
      return "wide";
    default:
      return "tall";
  }
}

export default function CartPage() {
  const {
    items,
    itemCount,
    totalPrice,
    isLoading,
    updateQuantity,
    removeFromCart,
    discount,
    discountAmount,
    finalTotal,
    shippingCost,
    applyDiscount,
    removeDiscount,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    setPromoError("");

    const result = await applyDiscount(promoCode.trim());

    if (!result.success) {
      setPromoError(result.error || "Invalid code");
    } else {
      setPromoCode("");
      setShowPromoInput(false);
    }

    setIsApplyingPromo(false);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-charcoal pt-24 sm:pt-32">
        <div className="section-container">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-charcoal pt-24 sm:pt-32">
        <div className="section-container">
          <div className="text-center py-12 sm:py-20">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray/30 mx-auto mb-4 sm:mb-6" />
            <h1 className="font-display text-2xl sm:text-3xl text-ivory mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-gray text-sm sm:text-base mb-6 sm:mb-8">Looks like you haven&apos;t added anything yet.</p>
            <Link href="/products" className="btn btn-primary">
              <span>Browse Collection</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-charcoal pt-24 sm:pt-32">
      <div className="section-container">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray hover:text-gold transition-colors mb-8 sm:mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm tracking-wide">Continue Shopping</span>
        </Link>

        <h1 className="font-display text-xl sm:text-2xl md:text-3xl text-ivory mb-6 sm:mb-8">
          Your Cart <span className="text-gray text-base sm:text-lg md:text-xl">({itemCount})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => {
              const bottleType = getBottleType(item.category);

              return (
                <div
                  key={item.id}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-charcoal-light border border-white/5"
                >
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-charcoal to-black flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center scale-75">
                      <div
                        className={`w-[25px] h-[12px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px] ${
                          bottleType === "tall" ? "relative" : ""
                        }`}
                      >
                        {bottleType === "tall" && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[5px] h-[15px] bg-gold rounded-[2px]" />
                        )}
                      </div>
                      <div
                        className={`bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 ${
                          bottleType === "serum"
                            ? "w-[45px] h-[80px] rounded"
                            : bottleType === "tall"
                            ? "w-[40px] h-[110px] rounded"
                            : "w-[60px] h-[65px] rounded-md"
                        }`}
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-grow min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-display text-base sm:text-lg text-ivory hover:text-gold transition-colors block truncate"
                    >
                      {item.name}
                    </Link>
                    <p className="text-gold font-display text-base sm:text-lg mt-1">
                      ${item.price.toFixed(0)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                      <div className="flex items-center border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 sm:p-2 text-gray hover:text-ivory transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="px-2 sm:px-4 py-1.5 sm:py-2 text-ivory min-w-[2rem] sm:min-w-[3rem] text-center text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 text-gray hover:text-ivory transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 sm:p-2 text-gray hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total - Hidden on small mobile, shown on sm+ */}
                  <div className="hidden sm:block text-right">
                    <span className="font-display text-lg sm:text-xl text-ivory">
                      ${(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-charcoal-light border border-white/5 p-5 sm:p-8 sticky top-24 sm:top-32">
              <h2 className="font-display text-lg sm:text-xl text-ivory mb-4 sm:mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(0)}</span>
                </div>

                {/* Discount Display */}
                {discount && (
                  <div className="flex justify-between items-center text-green-400">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm">{discount.code}</span>
                      <button
                        onClick={removeDiscount}
                        className="text-gray hover:text-red-400 transition-colors"
                        aria-label="Remove discount"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <span>-${discountAmount.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `$${shippingCost}`}</span>
                </div>

                {!discount?.type && totalPrice < 75 && shippingCost > 0 && (
                  <p className="text-xs text-gold">
                    Add ${(75 - totalPrice).toFixed(0)} more for free shipping!
                  </p>
                )}

                {discount?.type === "FREE_SHIPPING" && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Free shipping applied!
                  </p>
                )}
              </div>

              {/* Promo Code Section */}
              <div className="border-t border-white/10 pt-4 mb-4">
                {!discount ? (
                  <>
                    {!showPromoInput ? (
                      <button
                        onClick={() => setShowPromoInput(true)}
                        className="flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
                      >
                        <Tag className="w-4 h-4" />
                        <span>Have a promo code?</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase());
                              setPromoError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleApplyPromo();
                            }}
                            placeholder="Enter code"
                            className="flex-1 px-3 py-2 bg-black/50 border border-white/10 text-ivory text-sm placeholder:text-gray/50 focus:outline-none focus:border-gold/50"
                          />
                          <button
                            onClick={handleApplyPromo}
                            disabled={isApplyingPromo || !promoCode.trim()}
                            className="px-4 py-2 bg-gold text-black text-sm font-medium hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isApplyingPromo ? "..." : "Apply"}
                          </button>
                        </div>
                        {promoError && (
                          <p className="text-xs text-red-400">{promoError}</p>
                        )}
                        <button
                          onClick={() => {
                            setShowPromoInput(false);
                            setPromoCode("");
                            setPromoError("");
                          }}
                          className="text-xs text-gray hover:text-ivory transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Check className="w-4 h-4" />
                    <span>{discount.description} applied</span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mb-6 sm:mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-display text-base sm:text-lg text-ivory">Total</span>
                  <span className="font-display text-xl sm:text-2xl text-gold">
                    ${finalTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="btn btn-primary w-full justify-center">
                <span>Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <p className="text-xs text-gray text-center mt-4">
                Taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
