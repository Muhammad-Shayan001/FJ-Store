"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const totalCartItems = useCartStore((state) => state.totalItems);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Mobile Hamburger */}
        <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* LEFT: Logo */}
        <Link href="/" className="shrink-0">
          <BrandLogo width={160} height={40} className="w-[120px] md:w-[160px]" />
        </Link>

        {/* CENTER: Smart Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <div className="w-full relative group">
            <input
              type="text"
              placeholder="Search cosmetics, jewelry, food..."
              className="w-full bg-surface/50 border border-border rounded-full py-2 pl-12 pr-4 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all"
            />
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-blue transition-colors"
            />
          </div>
        </div>

        {/* RIGHT: Icons */}
        <div className="flex items-center space-x-6">
          <ThemeToggle />

          <Link
            href={user ? "/account" : "/login"}
            className="hidden md:flex items-center text-foreground hover:text-accent-blue transition-colors"
          >
            <User size={20} />
            <span className="sr-only">{user ? "Account" : "Login"}</span>
          </Link>

          <NotificationDropdown />

          <Link
            href="/cart"
            className="relative text-foreground hover:text-accent-blue transition-colors group"
          >
            <ShoppingBag size={20} />
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent-blue text-background text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                {totalCartItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border py-4 px-4 md:hidden flex flex-col space-y-4"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-text-muted focus:outline-none"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
            <nav className="flex flex-col space-y-4 pt-2">
              <Link
                href="/category/cosmetics"
                className="text-foreground hover:text-accent-gold font-medium"
              >
                Cosmetics
              </Link>
              <Link
                href="/category/jewelry"
                className="text-foreground hover:text-accent-gold font-medium"
              >
                Jewelry & Bangles
              </Link>
              <Link href="/category/food" className="text-foreground hover:text-accent-gold font-medium">
                Delicacies
              </Link>
              <div className="h-px bg-border w-full my-2"></div>
              <Link
                href="/account"
                className="flex items-center space-x-2 text-foreground hover:text-accent-blue"
              >
                <User size={18} />
                <span>My Account</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
