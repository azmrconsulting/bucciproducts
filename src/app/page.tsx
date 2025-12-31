import Link from "next/link";
import { ArrowRight, Check, Star, Mail, Instagram, Send } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

// Featured products data (will be replaced with database data later)
const products = [
  {
    id: 1,
    name: "Luxe Hair Oil",
    slug: "luxe-hair-oil",
    description: "Argan & vitamin E blend for ultimate shine and strength",
    price: 48,
    tag: "Bestseller",
    bottleType: "serum",
  },
  {
    id: 2,
    name: "Hydra Shampoo",
    slug: "hydra-shampoo",
    description: "Sulfate-free cleansing with keratin repair complex",
    price: 36,
    tag: null,
    bottleType: "tall",
  },
  {
    id: 3,
    name: "Silk Conditioner",
    slug: "silk-conditioner",
    description: "Deep moisture treatment with silk proteins",
    price: 38,
    tag: null,
    bottleType: "tall",
  },
  {
    id: 4,
    name: "Define Cream",
    slug: "define-cream",
    description: "Hold & definition without the crunch",
    price: 32,
    tag: "New",
    bottleType: "wide",
  },
];

const benefits = [
  {
    title: "Clean Formulas",
    description:
      "No sulfates, parabens, or silicones. Just pure, effective ingredients your hair will love.",
    icon: "clock",
  },
  {
    title: "Deep Hydration",
    description:
      "Advanced moisture-lock technology keeps hair hydrated from root to tip for days.",
    icon: "droplet",
  },
  {
    title: "Salon Results",
    description:
      "Professional-grade formulations that deliver visible results from the first use.",
    icon: "star",
  },
  {
    title: "All Hair Types",
    description:
      "Formulated to work beautifully on straight, wavy, curly, and coily textures.",
    icon: "target",
  },
];

const testimonials = [
  {
    text: "My hair has never felt this soft. The Luxe Oil is now a non-negotiable in my routine.",
    author: "Aaliyah M.",
    label: "Verified Buyer",
  },
  {
    text: "Finally found products that work for my 4C hair. The moisture lasts for days!",
    author: "Jasmine T.",
    label: "Verified Buyer",
  },
  {
    text: "Got the full set as a gift. Three months later, my stylist asked what I changed. Worth every cent.",
    author: "Rachel K.",
    label: "Verified Buyer",
  },
];

export default function HomePage() {
  // WebSite Schema for homepage
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bucciproducts.com";
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bucci Products",
    url: baseUrl,
    description:
      "Premium luxury hair care products crafted with the finest ingredients.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data - WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Hero Section */}
      <header className="lg:min-h-screen grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
        {/* Background Gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(201, 169, 98, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(201, 169, 98, 0.05) 0%, transparent 40%)
            `,
          }}
        />

        {/* Hero Content */}
        <div
          className="flex flex-col pt-24 pb-6 sm:pt-32 sm:pb-10 lg:justify-center lg:pt-0 lg:pb-0 relative z-[1] text-center lg:text-left items-center lg:items-start 2xl:pl-[10%]"
          style={{ paddingLeft: 'clamp(24px, 5vw, 96px)', paddingRight: 'clamp(24px, 5vw, 96px)' }}
        >
          {/* Spacer for header clearance - mobile only */}
          <div className="h-12 sm:h-16 lg:hidden w-full" aria-hidden="true" />

          {/* Badge - Hidden on mobile to reduce clutter */}
          <div className="hidden sm:flex items-center gap-3 mb-8 animate-fadeInUp opacity-0 [animation-delay:0.2s]">
            <span className="w-8 h-[1px] bg-gold" />
            <span className="font-display text-xs tracking-[0.3em] text-gold">
              LUXURY HAIR CARE
            </span>
            <span className="w-8 h-[1px] bg-gold" />
          </div>

          {/* Title */}
          <h1 className="mb-6 sm:mb-8">
            <span className="block font-display text-base sm:text-xl font-normal italic tracking-[0.15em] sm:tracking-[0.2em] text-ivory/80 mb-1 sm:mb-2 animate-fadeInUp opacity-0 [animation-delay:0.4s]">
              Elevate Your
            </span>
            <span className="block font-display text-[clamp(2.5rem,10vw,6rem)] font-medium tracking-[0.02em] leading-none text-ivory animate-fadeInUp opacity-0 [animation-delay:0.6s]">
              Crown
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray max-w-[400px] mb-6 sm:mb-10 lg:mb-12 px-2 sm:px-0 animate-fadeInUp opacity-0 [animation-delay:0.8s]">
            Premium hair care crafted for those who demand excellence. Nourish,
            style, and transform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 animate-fadeInUp opacity-0 [animation-delay:1s]">
            <Link href="/products" className="btn btn-primary justify-center">
              <span>Explore Collection</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#about" className="btn btn-secondary justify-center">
              Our Story
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div
          className="hero-visual-mobile flex items-center justify-center relative bg-gradient-to-br from-charcoal to-black lg:min-h-0 2xl:pr-[10%]"
          style={{ paddingLeft: 'clamp(16px, 4vw, 96px)', paddingRight: 'clamp(16px, 4vw, 96px)' }}
        >
          {/* Pulsing Circle - Hidden on small mobile */}
          <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] border border-gold/10 rounded-full animate-pulse" />

          {/* Product Showcase */}
          <div className="relative w-[240px] h-[260px] sm:w-[320px] sm:h-[360px] lg:w-[350px] lg:h-[400px] border border-gold animate-fadeIn opacity-0 [animation-delay:1.2s] flex items-center justify-center">
            {/* Bottles */}
            <div className="flex items-end justify-center gap-3 sm:gap-6 lg:gap-8 p-4 sm:p-8 lg:p-10">
              {/* Bottle 1 */}
              <div className="flex flex-col items-center animate-fadeInUp opacity-0 [animation-delay:1.4s]">
                <div className="w-[30px] h-[15px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px]" />
                <div className="w-[50px] h-[100px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-[5px] flex items-center justify-center">
                  <span className="font-display text-2xl text-gold/80">B</span>
                </div>
              </div>

              {/* Bottle 2 - Tall with pump */}
              <div className="flex flex-col items-center animate-fadeInUp opacity-0 [animation-delay:1.6s]">
                <div className="w-[20px] h-[30px] rounded-[3px] relative">
                  <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 w-[6px] h-[20px] bg-gold rounded-[3px]" />
                </div>
                <div className="w-[45px] h-[140px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-[5px] flex items-center justify-center">
                  <span className="font-display text-2xl text-gold/80">B</span>
                </div>
              </div>

              {/* Bottle 3 - Wide */}
              <div className="flex flex-col items-center animate-fadeInUp opacity-0 [animation-delay:1.8s]">
                <div className="w-[30px] h-[15px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px]" />
                <div className="w-[70px] h-[80px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-lg flex items-center justify-center">
                  <span className="font-display text-2xl text-gold/80">B</span>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[350px] lg:w-[400px] h-[250px] sm:h-[350px] lg:h-[400px] bg-gold/15 rounded-full blur-[60px] -z-10" />
          </div>

          {/* Decorative Elements - Hidden on mobile, proper spacing from edges */}
          <div className="hidden lg:block absolute top-12 right-12 xl:top-16 xl:right-16 w-16 lg:w-20 h-16 lg:h-20 border border-gold/30 animate-fadeIn opacity-0 [animation-delay:1.5s]" />
          <div className="hidden lg:block absolute bottom-16 left-12 xl:left-16 w-[50px] lg:w-[60px] h-[50px] lg:h-[60px] border border-gold/30 rotate-45 animate-fadeIn opacity-0 [animation-delay:1.7s]" />
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 animate-fadeIn opacity-0 [animation-delay:2.5s]">
          <span className="font-display text-[0.7rem] tracking-[0.2em] text-gray">
            Scroll
          </span>
          <div className="w-[1px] h-[60px] bg-gradient-to-b from-gold to-transparent" />
        </div>
      </header>

      {/* Products Section */}
      <section id="products" className="bg-charcoal relative">
        {/* Top Border */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="section-container">
          <div className="section-header">
            <span className="section-label">The Collection</span>
            <h2 className="section-title">
              Crafted for
              <br />
              <em>Excellence</em>
            </h2>
            <p className="section-intro">
              Each product in our line is meticulously formulated to deliver
              salon-quality results at home.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {products.map((product) => (
              <article key={product.id} className="card group">
                {/* Product Image */}
                <div className="relative aspect-square bg-gradient-to-br from-charcoal to-charcoal-light flex items-center justify-center">
                  {product.tag && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 font-display text-[0.55rem] sm:text-[0.6rem] tracking-[0.1em] uppercase px-2 py-1 sm:px-2.5 sm:py-1 bg-gold text-black">
                      {product.tag}
                    </span>
                  )}
                  {/* Placeholder Bottle */}
                  <div className="p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-[25px] h-[12px] bg-gradient-to-b from-gold to-gold-dark rounded-t-[3px] ${
                          product.bottleType === "tall" ? "relative" : ""
                        }`}
                      >
                        {product.bottleType === "tall" && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[5px] h-[15px] bg-gold rounded-[2px]" />
                        )}
                      </div>
                      <div
                        className={`bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 transition-all duration-400 group-hover:border-gold group-hover:shadow-[0_0_30px_rgba(201,169,98,0.2)] ${
                          product.bottleType === "serum"
                            ? "w-[45px] h-[80px] rounded"
                            : product.bottleType === "tall"
                            ? "w-[40px] h-[110px] rounded"
                            : "w-[60px] h-[65px] rounded-md"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 lg:p-5">
                  <h3 className="font-display text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2 text-ivory line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray mb-2 sm:mb-3 line-clamp-2 hidden sm:block">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-white/5">
                    <span className="font-display text-base sm:text-lg text-gold">
                      ${product.price}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="btn-small"
                    >
                      Shop
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="bg-black relative overflow-hidden">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-24 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <span className="section-label">The Signature Set</span>
              <h2 className="section-title">
                Complete
                <br />
                <em>Transformation</em>
              </h2>
              <p className="text-base sm:text-lg text-gray mb-8 sm:mb-12">
                Experience the full Bucci ritual. Our signature set combines all
                four products for a complete hair care system that cleanses,
                conditions, treats, and styles.
              </p>

              {/* Includes List */}
              <ul className="list-none mb-8 sm:mb-12">
                {[
                  "Hydra Shampoo (250ml)",
                  "Silk Conditioner (250ml)",
                  "Luxe Hair Oil (50ml)",
                  "Define Cream (100ml)",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-4 py-4 border-b border-white/5 text-ivory"
                  >
                    <Check className="w-5 h-5 text-gold flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-8 mb-6 sm:mb-8">
                <span className="font-display text-xl sm:text-2xl text-gray line-through">
                  $154
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray uppercase tracking-[0.1em]">
                    Set Price
                  </span>
                  <span className="font-display text-4xl sm:text-5xl font-medium text-gold leading-none">
                    $129
                  </span>
                </div>
              </div>

              <Link href="/products/signature-set" className="btn btn-primary btn-large">
                <span>Get the Set</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Visual */}
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[400px] lg:h-[400px]">
                {/* Floating Set Items */}
                <div className="absolute w-[35px] sm:w-[45px] lg:w-[50px] h-[85px] sm:h-[100px] lg:h-[120px] top-1/2 left-[20%] -translate-y-1/2 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded animate-float" />
                <div className="absolute w-[32px] sm:w-[40px] lg:w-[45px] h-[70px] sm:h-[85px] lg:h-[100px] top-[40%] left-[38%] -translate-y-1/2 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded animate-float [animation-delay:0.5s]" />
                <div className="absolute w-[38px] sm:w-[48px] lg:w-[55px] h-[65px] sm:h-[75px] lg:h-[90px] top-[55%] left-[55%] -translate-y-1/2 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded-md animate-float [animation-delay:1s]" />
                <div className="absolute w-[28px] sm:w-[35px] lg:w-[40px] h-[50px] sm:h-[60px] lg:h-[70px] top-[45%] left-[72%] -translate-y-1/2 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gold/30 rounded animate-float [animation-delay:1.5s]" />

                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[250px] lg:w-[300px] h-[200px] sm:h-[250px] lg:h-[300px] bg-gold/15 rounded-full blur-[50px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-charcoal relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="section-container">
          <div className="section-header">
            <span className="section-label">Why Bucci</span>
            <h2 className="section-title">
              The
              <br />
              <em>Difference</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="p-4 sm:p-5 lg:p-6 bg-black border border-white/5 transition-all duration-400 relative overflow-hidden text-center group hover:-translate-y-1 hover:border-gold/20 hover:shadow-lg"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gold origin-left scale-x-0 transition-transform duration-400 group-hover:scale-x-100" />

                {/* Icon */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4 text-gold">
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-full h-full"
                  >
                    {benefit.icon === "clock" && (
                      <>
                        <circle cx="24" cy="24" r="18" />
                        <path d="M24 14v10l6 6" />
                      </>
                    )}
                    {benefit.icon === "droplet" && (
                      <path d="M24 4c-6 8-16 14-16 24a16 16 0 1032 0c0-10-10-16-16-24z" />
                    )}
                    {benefit.icon === "star" && (
                      <path d="M24 4l6 12 14 2-10 10 2 14-12-6-12 6 2-14L4 18l14-2z" />
                    )}
                    {benefit.icon === "target" && (
                      <>
                        <circle cx="24" cy="24" r="18" />
                        <path d="M16 24c0-4.4 3.6-8 8-8" />
                        <circle cx="24" cy="24" r="4" />
                      </>
                    )}
                  </svg>
                </div>

                <h3 className="font-display text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2 text-ivory">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray leading-relaxed hidden sm:block">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative overflow-hidden min-h-[80vh] flex items-center"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black to-charcoal" />
        <div
          className="absolute top-0 right-0 w-1/2 h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(201, 169, 98, 0.03) 40px, rgba(201, 169, 98, 0.03) 41px)`,
          }}
        />

        <div className="section-container relative z-[1]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-24 items-center">
            {/* Image Placeholder */}
            <div className="order-2 lg:order-1">
              <div className="aspect-square bg-charcoal border border-gold/20 flex items-center justify-center relative overflow-hidden">
                <div className="w-[60%] h-[60%] border border-gold/30 rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] left-[20%] flex gap-2">
                  <span className="w-10 h-[2px] bg-gold/50" />
                  <span className="w-10 h-[2px] bg-gold/50" />
                  <span className="w-10 h-[2px] bg-gold/50" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <span className="section-label">Our Story</span>
              <h2 className="section-title">
                Beauty
                <br />
                <em>Reimagined</em>
              </h2>
              <div className="mb-8 sm:mb-12">
                <p className="text-base sm:text-lg text-gray mb-4 sm:mb-6">
                  Bucci Products was born from a simple belief: everyone
                  deserves hair care that actually works. Founded by beauty
                  industry veterans, we set out to create products that combine
                  luxury with real results.
                </p>
                <p className="text-base sm:text-lg text-gray">
                  Every formula is developed in collaboration with top stylists
                  and dermatologists, then tested extensively to ensure it
                  delivers on its promise. No compromises, no shortcuts—just
                  beautiful hair.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:gap-16 pt-8 sm:pt-12 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-gold leading-none">
                    10K+
                  </span>
                  <span className="text-xs sm:text-[0.85rem] text-gray mt-1 sm:mt-2">
                    Happy Customers
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-gold leading-none">
                    100%
                  </span>
                  <span className="text-xs sm:text-[0.85rem] text-gray mt-1 sm:mt-2">
                    Cruelty Free
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-gold leading-none">
                    USA
                  </span>
                  <span className="text-xs sm:text-[0.85rem] text-gray mt-1 sm:mt-2">
                    Made & Shipped
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-black text-center">
        <div className="section-container">
          <span className="section-label">Reviews</span>
          <h2 className="section-title centered mb-12">
            What They&apos;re
            <br />
            <em>Saying</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-10">
            {testimonials.map((testimonial, index) => (
              <blockquote
                key={index}
                className="p-4 sm:p-5 lg:p-6 bg-charcoal border border-white/5 text-left"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-gold fill-gold"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base italic text-ivory mb-3 sm:mb-4 line-clamp-4">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <cite className="not-italic">
                  <strong className="block font-display text-base text-gold">
                    {testimonial.author}
                  </strong>
                  <span className="text-[0.85rem] text-gray">
                    {testimonial.label}
                  </span>
                </cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-charcoal relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-24 items-start">
            {/* Contact Info */}
            <div>
              <span className="section-label">Get in Touch</span>
              <h2 className="section-title">
                Let&apos;s
                <br />
                <em>Connect</em>
              </h2>
              <p className="text-base sm:text-lg text-gray max-w-[400px] mb-8 sm:mb-12">
                Questions about our products? Want to become a stockist? We'd
                love to hear from you.
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href="mailto:hello@bucciproducts.com"
                  className="inline-flex items-center gap-4 text-ivory hover:text-gold transition-colors duration-300"
                >
                  <Mail className="w-6 h-6 text-gold" />
                  hello@bucciproducts.com
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-4 text-ivory hover:text-gold transition-colors duration-300"
                >
                  <Instagram className="w-6 h-6 text-gold" />
                  @bucciproducts
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <form className="flex flex-col gap-5 sm:gap-6 lg:gap-8">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Subject
                </label>
                <select id="subject" name="subject" className="form-select">
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Question</option>
                  <option value="wholesale">Wholesale/Stockist</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="form-textarea"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-large">
                <span>Send Message</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
