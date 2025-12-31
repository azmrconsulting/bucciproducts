import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { href: "/products", label: "All Products" },
      { href: "/products?category=hair-oil", label: "Hair Oils" },
      { href: "/products?category=shampoo", label: "Shampoos" },
      { href: "/products?category=conditioner", label: "Conditioners" },
    ],
    company: [
      { href: "/#about", label: "About Us" },
      { href: "/#contact", label: "Contact" },
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
    ],
    support: [
      { href: "/faq", label: "FAQ" },
      { href: "/track-order", label: "Track Order" },
      { href: "/account", label: "My Account" },
      { href: "/contact", label: "Help" },
    ],
  };

  return (
    <footer className="bg-black border-t border-white/5">
      <div className="max-w-[1400px] mx-auto py-12 sm:py-16 md:py-24" style={{ paddingLeft: 'clamp(24px, 5vw, 96px)', paddingRight: 'clamp(24px, 5vw, 96px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex flex-col items-start mb-4">
              <span className="font-display text-2xl font-semibold tracking-[0.3em] text-gold leading-none">
                BUCCI
              </span>
              <span className="font-display text-[0.6rem] tracking-[0.5em] text-ivory/70 mt-0.5">
                HAIR CARE
              </span>
            </Link>
            <p className="text-gray text-[0.95rem] max-w-[300px] mt-4">
              Premium hair care products crafted with the finest ingredients for
              luxurious, healthy hair.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <a
                href="mailto:hello@bucciproducts.com"
                className="inline-flex items-center gap-3 text-ivory hover:text-gold transition-colors duration-300"
              >
                <Mail className="w-4 h-4 text-gold" />
                <span>hello@bucciproducts.com</span>
              </a>
              <a
                href="tel:+1234567890"
                className="inline-flex items-center gap-3 text-ivory hover:text-gold transition-colors duration-300"
              >
                <Phone className="w-4 h-4 text-gold" />
                <span>(123) 456-7890</span>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-[0.85rem] tracking-[0.15em] uppercase text-ivory mb-4">
              Shop
            </h4>
            <ul className="list-none space-y-3 sm:space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray text-[0.95rem] hover:text-gold transition-colors duration-300 py-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-[0.85rem] tracking-[0.15em] uppercase text-ivory mb-4">
              Company
            </h4>
            <ul className="list-none space-y-3 sm:space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray text-[0.95rem] hover:text-gold transition-colors duration-300 py-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display text-[0.85rem] tracking-[0.15em] uppercase text-ivory mb-4">
              Support
            </h4>
            <ul className="list-none space-y-3 sm:space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray text-[0.95rem] hover:text-gold transition-colors duration-300 py-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1400px] mx-auto py-4 sm:py-6 border-t border-white/5" style={{ paddingLeft: 'clamp(24px, 5vw, 96px)', paddingRight: 'clamp(24px, 5vw, 96px)' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray text-[0.85rem]">
            &copy; {currentYear} Bucci Products. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-gray text-[0.85rem] hover:text-gold transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray text-[0.85rem] hover:text-gold transition-colors duration-300"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
