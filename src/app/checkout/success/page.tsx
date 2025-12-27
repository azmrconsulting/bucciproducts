"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Clear cart after successful checkout
    if (sessionId && !cleared) {
      clearCart();
      setCleared(true);
    }
  }, [sessionId, cleared, clearCart]);

  return (
    <main className="min-h-screen bg-charcoal pt-32">
      <div className="section-container max-w-2xl text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="font-display text-4xl text-ivory mb-4">
          Thank You for Your Order!
        </h1>

        <p className="text-gray text-lg mb-8">
          Your payment was successful. We&apos;ve sent a confirmation email with your
          order details.
        </p>

        {/* Order Info Box */}
        <div className="bg-charcoal-light border border-white/5 p-8 mb-12 text-left">
          <div className="flex items-start gap-4">
            <Package className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-display text-lg text-ivory mb-2">
                What&apos;s Next?
              </h2>
              <ul className="space-y-2 text-gray">
                <li>You&apos;ll receive an order confirmation email shortly</li>
                <li>We&apos;ll notify you when your order ships</li>
                <li>Most orders arrive within 3-5 business days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products" className="btn btn-primary">
            <span>Continue Shopping</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>

        {/* Session ID for reference */}
        {sessionId && (
          <p className="mt-12 text-xs text-gray/50">
            Reference: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-charcoal pt-32">
      <div className="section-container max-w-2xl text-center">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
