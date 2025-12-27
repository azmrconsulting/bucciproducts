"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, isLoading: cartLoading } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to cart if empty
    if (!cartLoading && items.length === 0) {
      router.push("/cart");
    }
  }, [cartLoading, items, router]);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <main className="min-h-screen bg-charcoal pt-32">
        <div className="section-container">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  const shipping = totalPrice >= 75 ? 0 : 8;
  const total = totalPrice + shipping;

  return (
    <main className="min-h-screen bg-charcoal pt-32">
      <div className="section-container max-w-2xl">
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-gray hover:text-gold transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm tracking-wide">Back to Cart</span>
        </Link>

        <h1 className="font-display text-4xl text-ivory mb-8">Checkout</h1>

        {/* Order Summary */}
        <div className="bg-charcoal-light border border-white/5 p-8 mb-8">
          <h2 className="font-display text-xl text-ivory mb-6">Order Summary</h2>

          {/* Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-gray">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-gray">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-gray">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
            </div>
            <div className="flex justify-between text-ivory font-display text-xl pt-4 border-t border-white/10">
              <span>Total</span>
              <span className="text-gold">${total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isLoading || items.length === 0}
          className="btn btn-primary btn-large w-full justify-center"
        >
          {isLoading ? (
            <span>Redirecting to payment...</span>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Proceed to Payment</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray text-center mt-4">
          You&apos;ll be redirected to Stripe for secure payment
        </p>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 mt-8 text-gray/60">
          <Lock className="w-4 h-4" />
          <span className="text-xs">Secured by Stripe</span>
        </div>
      </div>
    </main>
  );
}
