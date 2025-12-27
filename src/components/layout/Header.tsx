"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/#collection", label: "Collection" },
    { href: "/#about", label: "About" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-400 ${
        isScrolled
          ? "bg-black/95 backdrop-blur-[20px] py-3 border-b border-gold/10"
          : "py-5 lg:py-6"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <nav className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-start flex-shrink-0">
          <span className="font-display text-xl sm:text-2xl font-semibold tracking-[0.2em] sm:tracking-[0.3em] text-gold leading-none">
            BUCCI
          </span>
          <span className="font-display text-[0.5rem] sm:text-[0.6rem] tracking-[0.3em] sm:tracking-[0.5em] text-ivory/70 mt-0.5">
            HAIR CARE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex list-none gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="font-display text-[0.85rem] tracking-[0.1em] uppercase text-ivory/80 hover:text-gold hover:opacity-100 transition-all duration-300 relative group"
              >
                {link.label}
                <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* User Account */}
          <Link
            href={session ? "/account" : "/auth/login"}
            className="hidden md:flex items-center gap-2 font-display text-[0.8rem] tracking-[0.1em] uppercase text-ivory/80 hover:text-gold transition-colors duration-300"
          >
            <User className="w-5 h-5" />
            <span className="hidden lg:inline">
              {session ? "Account" : "Sign In"}
            </span>
          </Link>

          {/* Cart Button */}
          <Link
            href="/cart"
            className="relative p-2 text-gold hover:text-gold-light transition-colors duration-300"
          >
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-black text-xs font-display font-semibold rounded-full flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gold" />
            ) : (
              <Menu className="w-6 h-6 text-gold" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-black/98 backdrop-blur-[20px] z-[999]">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-2xl tracking-[0.2em] uppercase text-ivory hover:text-gold transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-8 pt-8 border-t border-white/10 w-48 flex flex-col items-center gap-4">
              <Link
                href={session ? "/account" : "/auth/login"}
                className="font-display text-lg tracking-[0.15em] uppercase text-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {session ? "My Account" : "Sign In"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
