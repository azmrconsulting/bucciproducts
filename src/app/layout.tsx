import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://bucciproducts.com"
  ),
  title: {
    default: "Bucci Products | Premium Hair Care",
    template: "%s | Bucci Products",
  },
  description:
    "Discover luxury hair care products crafted with the finest ingredients. Transform your hair with Bucci's premium oils, shampoos, and treatments.",
  keywords: [
    "hair care",
    "luxury hair products",
    "hair oil",
    "shampoo",
    "conditioner",
    "premium beauty",
    "natural hair care",
    "professional hair care",
  ],
  authors: [{ name: "Bucci Products" }],
  creator: "Bucci Products",
  publisher: "Bucci Products",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Bucci Products | Premium Hair Care",
    description:
      "Discover luxury hair care products crafted with the finest ingredients. Transform your hair with Bucci's premium oils, shampoos, and treatments.",
    type: "website",
    locale: "en_US",
    siteName: "Bucci Products",
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bucci Products - Premium Hair Care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bucci Products | Premium Hair Care",
    description:
      "Discover luxury hair care products crafted with the finest ingredients.",
    images: ["/og-image.jpg"],
    creator: "@bucciproducts",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization Schema Markup
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bucciproducts.com";
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bucci Products",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "Premium luxury hair care products crafted with the finest ingredients.",
    foundingDate: "2024",
    sameAs: [
      // Add social media profiles when available
      // "https://www.facebook.com/bucciproducts",
      // "https://www.instagram.com/bucciproducts",
      // "https://twitter.com/bucciproducts",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "info@bucciproducts.com",
    },
  };

  return (
    <html lang="en">
      <body className="antialiased">
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        <Providers>
          {/* Geometric Pattern Overlay */}
          <div className="geo-pattern" aria-hidden="true" />

          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="relative z-[1]">{children}</main>

          {/* Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
