import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Star, Truck, Shield, Leaf } from "lucide-react";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/cart/AddToCartButton";
import type { Metadata } from "next";

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
  });

  if (!product) {
    return {
      title: "Product Not Found | Bucci Products",
      description: "The product you're looking for could not be found.",
    };
  }

  const price = (product.priceCents / 100).toFixed(2);
  const avgRating =
    product.reviews.length > 0
      ? (
          product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bucciproducts.com";
  const productUrl = `${baseUrl}/products/${slug}`;

  return {
    title: `${product.name} | Bucci Products`,
    description:
      product.shortDescription ||
      product.description?.substring(0, 160) ||
      `Shop ${product.name} - Premium hair care products from Bucci Products.`,
    keywords: [
      product.name,
      product.category || "hair care",
      "luxury hair care",
      "premium beauty",
      "Bucci Products",
      ...product.tags,
    ],
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description || "",
      type: "website",
      url: productUrl,
      siteName: "Bucci Products",
      locale: "en_US",
      images: product.images[0]?.url
        ? [
            {
              url: product.images[0].url,
              width: 1200,
              height: 1200,
              alt: product.name,
            },
          ]
        : [
            {
              url: `${baseUrl}/og-product.jpg`,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription || product.description || "",
      images: product.images[0]?.url ? [product.images[0].url] : [`${baseUrl}/og-product.jpg`],
    },
    other: {
      "product:price:amount": price,
      "product:price:currency": "USD",
      ...(avgRating && { "product:rating:value": avgRating }),
      ...(product.reviews.length > 0 && {
        "product:rating:count": product.reviews.length.toString(),
      }),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      inventory: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!product) {
    notFound();
  }

  const bottleType = getBottleType(product.category);
  const price = (product.priceCents / 100).toFixed(0);
  const comparePrice = product.compareAtPriceCents
    ? (product.compareAtPriceCents / 100).toFixed(0)
    : null;
  const inStock = product.inventory ? product.inventory.quantity > 0 : true;

  // Calculate average rating
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length
      : 0;

  // Structured data for Product and Breadcrumb Schema
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bucciproducts.com";

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${baseUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${baseUrl}/products/${product.slug}`,
      },
    ],
  };

  // Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images[0]?.url || `${baseUrl}/og-product.jpg`,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Bucci Products",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(product.reviews.length > 0 && {
      review: product.reviews.map((review) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating.toString(),
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Person",
          name:
            review.user?.firstName && review.user?.lastName
              ? `${review.user.firstName} ${review.user.lastName}`
              : review.user?.firstName || "Anonymous",
        },
        ...(review.title && { headline: review.title }),
        reviewBody: review.body,
        datePublished: review.createdAt.toISOString(),
      })),
    }),
  };

  return (
    <>
      {/* JSON-LD Structured Data - Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* JSON-LD Structured Data - Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-charcoal product-page-main">
        <div className="section-container">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray hover:text-gold transition-colors mb-8 sm:mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm tracking-wide">Back to Collection</span>
        </Link>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-charcoal to-charcoal-light border border-gold/20 flex items-center justify-center lg:sticky lg:top-28 overflow-hidden">
              {/* Tag */}
              {product.tags.includes("bestseller") && (
                <span className="absolute top-6 left-6 z-10 font-display text-[0.7rem] tracking-[0.15em] uppercase px-4 py-2 bg-gold text-black">
                  Bestseller
                </span>
              )}
              {product.tags.includes("new") && (
                <span className="absolute top-6 left-6 z-10 font-display text-[0.7rem] tracking-[0.15em] uppercase px-4 py-2 bg-gold text-black">
                  New
                </span>
              )}

              {/* Product Image or Placeholder Bottle */}
              {product.images[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].altText || product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : bottleType === "set" ? (
                <div className="flex items-end justify-center gap-4 scale-[1.5]">
                  {/* Bottle 1 - Tall */}
                  <div className="flex flex-col items-center">
                    <div className="w-[20px] h-[10px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px] relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[4px] h-[12px] bg-gold rounded-[2px]" />
                    </div>
                    <div className="w-[32px] h-[85px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded flex items-center justify-center">
                      <span className="font-display text-lg text-gold/60">B</span>
                    </div>
                  </div>
                  {/* Bottle 2 - Tall */}
                  <div className="flex flex-col items-center">
                    <div className="w-[20px] h-[10px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px] relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[4px] h-[12px] bg-gold rounded-[2px]" />
                    </div>
                    <div className="w-[32px] h-[85px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded flex items-center justify-center">
                      <span className="font-display text-lg text-gold/60">B</span>
                    </div>
                  </div>
                  {/* Bottle 3 - Serum */}
                  <div className="flex flex-col items-center">
                    <div className="w-[20px] h-[10px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px]" />
                    <div className="w-[36px] h-[65px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded flex items-center justify-center">
                      <span className="font-display text-lg text-gold/60">B</span>
                    </div>
                  </div>
                  {/* Bottle 4 - Wide */}
                  <div className="flex flex-col items-center">
                    <div className="w-[24px] h-[10px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px]" />
                    <div className="w-[48px] h-[52px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-md flex items-center justify-center">
                      <span className="font-display text-lg text-gold/60">B</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center scale-[2]">
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
                    className={`bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 flex items-center justify-center ${
                      bottleType === "serum"
                        ? "w-[45px] h-[80px] rounded"
                        : bottleType === "tall"
                        ? "w-[40px] h-[110px] rounded"
                        : "w-[60px] h-[65px] rounded-md"
                    }`}
                  >
                    <span className="font-display text-2xl text-gold/60">B</span>
                  </div>
                </div>
              )}

              {/* Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold/10 rounded-full blur-[80px] -z-10" />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category */}
            <span className="font-display text-xs tracking-[0.3em] text-gold uppercase mb-4">
              {product.category || "Hair Care"}
            </span>

            {/* Title */}
            <h1 className="font-display text-4xl lg:text-5xl font-medium text-ivory mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= avgRating
                          ? "text-gold fill-gold"
                          : "text-gray/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray">
                  ({product.reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Short Description */}
            <p className="text-lg text-gray mb-8">{product.shortDescription}</p>

            {/* Price */}
            <div className="flex items-end gap-4 mb-8">
              <span className="font-display text-4xl text-gold">${price}</span>
              {comparePrice && (
                <span className="font-display text-xl text-gray line-through mb-1">
                  ${comparePrice}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-8">
              <div
                className={`w-2 h-2 rounded-full ${
                  inStock ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray">
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Add to Cart Button */}
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                priceCents: product.priceCents,
                category: product.category,
              }}
              disabled={!inStock}
              className="mb-8"
            />

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/10">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-5 h-5 text-gold" />
                <span className="text-xs text-gray">Free Shipping $75+</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-5 h-5 text-gold" />
                <span className="text-xs text-gray">30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Leaf className="w-5 h-5 text-gold" />
                <span className="text-xs text-gray">Clean Formula</span>
              </div>
            </div>

            {/* Full Description */}
            <div className="py-8">
              <h2 className="font-display text-lg font-medium text-ivory mb-4">
                About This Product
              </h2>
              <p className="text-gray leading-relaxed">{product.description}</p>
            </div>

            {/* Benefits */}
            <div className="py-8 border-t border-white/10">
              <h2 className="font-display text-lg font-medium text-ivory mb-4">
                Benefits
              </h2>
              <ul className="space-y-3">
                {[
                  "Sulfate-free & paraben-free formula",
                  "Suitable for all hair types",
                  "Cruelty-free & vegan",
                  "Professional salon quality",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-gray">
                    <Check className="w-4 h-4 text-gold flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <section className="mt-24 pt-16 border-t border-white/10">
            <h2 className="font-display text-2xl font-medium text-ivory mb-12">
              Customer Reviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-charcoal-light border border-white/5 p-8"
                >
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-gold fill-gold"
                            : "text-gray/30"
                        }`}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h3 className="font-display font-medium text-ivory mb-2">
                      {review.title}
                    </h3>
                  )}
                  <p className="text-gray text-sm mb-4">{review.body}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ivory">
                      {review.user?.firstName || "Anonymous"}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs text-gold">Verified Buyer</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
    </>
  );
}
