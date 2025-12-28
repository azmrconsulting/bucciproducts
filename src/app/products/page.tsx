import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Shop Collection",
  description:
    "Browse our complete collection of premium luxury hair care products. From nourishing oils to professional shampoos and conditioners - find the perfect products for your hair.",
  keywords: [
    "hair care products",
    "luxury hair care collection",
    "premium shampoo",
    "hair oil",
    "conditioner",
    "styling products",
    "professional hair care",
  ],
  openGraph: {
    title: "Shop Our Collection | Bucci Products",
    description:
      "Browse our complete collection of premium luxury hair care products.",
    type: "website",
    url: "/products",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Our Collection | Bucci Products",
    description:
      "Browse our complete collection of premium luxury hair care products.",
  },
  alternates: {
    canonical: "/products",
  },
};

// Determine bottle type based on category for visual display
function getBottleType(category: string | null): "serum" | "tall" | "wide" | "set" {
  switch (category) {
    case "oils":
      return "serum";
    case "shampoo":
    case "conditioner":
      return "tall";
    case "styling":
      return "wide";
    case "sets":
      return "set";
    default:
      return "tall";
  }
}

// Get tag based on product properties
function getProductTag(product: { tags: string[]; isFeatured: boolean }): string | null {
  if (product.tags.includes("bestseller")) return "Bestseller";
  if (product.tags.includes("new")) return "New";
  if (product.isFeatured) return "Featured";
  return null;
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-charcoal pt-24 sm:pt-32">
      {/* Page Header */}
      <div className="section-container">
        <div className="section-header">
          <span className="section-label">Shop</span>
          <h1 className="section-title">
            Our
            <br />
            <em>Collection</em>
          </h1>
          <p className="section-intro">
            Premium hair care crafted for those who demand excellence. Each
            product is meticulously formulated to deliver salon-quality results.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => {
            const bottleType = getBottleType(product.category);
            const tag = getProductTag(product);
            const price = (product.priceCents / 100).toFixed(0);

            return (
              <article key={product.id} className="card group">
                {/* Product Image */}
                <div className="relative aspect-square bg-gradient-to-br from-charcoal to-charcoal-light flex items-center justify-center">
                  {tag && (
                    <span className="absolute top-4 left-4 font-display text-[0.65rem] tracking-[0.15em] uppercase px-3 py-1.5 bg-gold text-black">
                      {tag}
                    </span>
                  )}
                  {/* Placeholder Bottle or Set */}
                  <div className="p-12">
                    {bottleType === "set" ? (
                      <div className="flex items-end justify-center gap-2">
                        <div className="flex flex-col items-center">
                          <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px] relative">
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[3px] h-[8px] bg-gold rounded-[1px]" />
                          </div>
                          <div className="w-[22px] h-[60px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 group-hover:border-gold" />
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px] relative">
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[3px] h-[8px] bg-gold rounded-[1px]" />
                          </div>
                          <div className="w-[22px] h-[60px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 group-hover:border-gold" />
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-[14px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px]" />
                          <div className="w-[25px] h-[45px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded transition-all duration-400 group-hover:border-gold" />
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-[16px] h-[7px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[2px]" />
                          <div className="w-[32px] h-[36px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-md transition-all duration-400 group-hover:border-gold" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
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
                          className={`bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 transition-all duration-400 group-hover:border-gold group-hover:shadow-[0_0_30px_rgba(201,169,98,0.2)] ${
                            bottleType === "serum"
                              ? "w-[45px] h-[80px] rounded"
                              : bottleType === "tall"
                              ? "w-[40px] h-[110px] rounded"
                              : "w-[60px] h-[65px] rounded-md"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-6 lg:p-8">
                  <h3 className="font-display text-lg sm:text-xl font-medium mb-2 text-ivory">
                    {product.name}
                  </h3>
                  <p className="text-sm sm:text-[0.9rem] text-gray mb-3 sm:mb-4 line-clamp-2">
                    {product.shortDescription}
                  </p>
                  <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-white/5">
                    <span className="font-display text-lg sm:text-xl text-gold">
                      ${price}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="btn-small"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray text-lg">No products available yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
