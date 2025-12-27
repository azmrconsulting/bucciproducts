import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="font-display text-[180px] lg:text-[240px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-gold to-gold-dark leading-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] -z-10" />
        </div>

        {/* Error Message */}
        <h2 className="font-display text-3xl lg:text-4xl font-medium text-ivory mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray mb-12 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-black font-display text-sm tracking-[0.15em] uppercase hover:bg-gold-dark transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 border border-gold/30 text-gold font-display text-sm tracking-[0.15em] uppercase hover:bg-gold/10 transition-colors"
          >
            Shop Collection
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-sm text-gray mb-4">Popular Pages</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/products"
              className="text-sm text-gold hover:text-gold-dark transition-colors"
            >
              All Products
            </Link>
            <span className="text-gray/30">•</span>
            <Link
              href="/cart"
              className="text-sm text-gold hover:text-gold-dark transition-colors"
            >
              Shopping Cart
            </Link>
            <span className="text-gray/30">•</span>
            <Link
              href="/"
              className="text-sm text-gold hover:text-gold-dark transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
