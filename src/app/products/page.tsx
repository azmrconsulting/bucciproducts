import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ProductCard from "@/components/storefront/ProductCard";

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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                shortDescription: product.shortDescription,
                priceCents: product.priceCents,
                category: product.category,
                tags: product.tags,
                isFeatured: product.isFeatured,
                images: product.images.map((img) => ({
                  url: img.url,
                  altText: img.altText,
                })),
              }}
            />
          ))}
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
