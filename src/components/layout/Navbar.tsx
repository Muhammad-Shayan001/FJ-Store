"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, User, Menu, X, Heart, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/lib/store/useAuthStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BrandLogo } from "@/components/ui/BrandLogo";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop All", href: "/shop" },
  { name: "Cosmetics", href: "/category/cosmetics" },
  { name: "Jewelry", href: "/category/jewelry" },
  { name: "Delicacies", href: "/category/food" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* Mobile Hamburger */}
        <button className="lg:hidden text-foreground hover:text-accent-gold transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* LEFT: Logo */}
        <Link href="/" className="shrink-0 flex items-center group">
          <BrandLogo width={160} height={40} className="w-[130px] md:w-[160px] group-hover:scale-105 transition-transform duration-300" />
        </Link>

        {/* CENTER: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-sm font-medium tracking-wide transition-colors hover:text-accent-gold ${
                  isActive ? "text-accent-gold" : "text-foreground"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-accent-gold rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Icons & Actions */}
        <div className="flex items-center space-x-5 md:space-x-6">
          {/* Smart Search */}
          <div className="hidden md:flex relative group w-48 lg:w-64">
            <input
              type="text"
              placeholder="Search luxury..."
              className="w-full bg-surface/50 border border-border/50 rounded-full py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50 transition-all"
            />
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-gold transition-colors"
            />
          </div>

          <ThemeToggle />

          <Link href="/wishlist" className="hidden md:flex text-foreground hover:text-accent-gold transition-colors relative group">
            <Heart size={20} className="group-hover:scale-110 transition-transform" />
          </Link>

          <Link
            href={user ? "/account" : "/login"}
            className="hidden md:flex items-center text-foreground hover:text-accent-gold transition-colors group"
          >
            <User size={20} className="group-hover:scale-110 transition-transform" />
            <span className="sr-only">{user ? "Account" : "Login"}</span>
          </Link>

          <Link
            href="/cart"
            className="relative text-foreground hover:text-accent-gold transition-colors group flex items-center"
          >
            <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
            <AnimatePresence>
              {totalCartItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 bg-accent-gold text-background text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-lg"
                >
                  {totalCartItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border lg:hidden overflow-hidden"
          >
            <div className="p-4 flex flex-col space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search luxury..."
                  className="w-full bg-surface border border-border rounded-full py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:border-accent-gold"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
              
              {/* Mobile Links */}
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-foreground hover:text-accent-gold font-medium text-lg px-2"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="h-px bg-border w-full"></div>
              
              {/* Mobile Bottom Actions */}
              <div className="flex justify-between px-2 pb-4">
                <Link
                  href={user ? "/account" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center space-y-1 text-foreground hover:text-accent-gold"
                >
                  <User size={20} />
                  <span className="text-xs font-medium">{user ? "Account" : "Login"}</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex flex-col items-center space-y-1 text-foreground hover:text-accent-gold"
                >
                  <Heart size={20} />
                  <span className="text-xs font-medium">Wishlist</span>
                </Link>
                <div className="flex flex-col items-center space-y-1 text-foreground">
                  <ThemeToggle />
                  <span className="text-xs font-medium">Theme</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
