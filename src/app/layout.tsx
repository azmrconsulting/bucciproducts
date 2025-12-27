import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Bucci Products | Premium Hair Care",
  description:
    "Discover luxury hair care products crafted with the finest ingredients. Transform your hair with Bucci's premium oils, shampoos, and treatments.",
  keywords: [
    "hair care",
    "luxury hair products",
    "hair oil",
    "shampoo",
    "conditioner",
    "premium beauty",
  ],
  openGraph: {
    title: "Bucci Products | Premium Hair Care",
    description:
      "Discover luxury hair care products crafted with the finest ingredients.",
    type: "website",
    locale: "en_US",
    siteName: "Bucci Products",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
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
