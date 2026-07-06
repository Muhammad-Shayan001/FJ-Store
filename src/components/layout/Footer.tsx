import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border pt-20 pb-8 mt-auto relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6 group">
              <BrandLogo width={180} height={48} className="group-hover:scale-105 transition-transform" />
            </Link>
            <p className="text-text-muted max-w-sm mb-6 leading-relaxed">
              Discover a curated selection of premium cosmetics, elegant jewelry, and exquisite delicacies designed for a sophisticated lifestyle. True luxury, delivered.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-accent-gold hover:text-white hover:border-accent-gold transition-all duration-300" aria-label="Instagram">
                <span className="text-sm font-semibold">in</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-accent-blue hover:text-white hover:border-accent-blue transition-all duration-300" aria-label="Facebook">
                <span className="text-sm font-semibold">f</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:text-accent-gold transition-all duration-300" aria-label="Twitter">
                <span className="text-sm font-semibold">x</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:text-red-500 transition-all duration-300" aria-label="YouTube">
                <span className="text-sm font-semibold">▶</span>
              </a>
            </div>
          </div>
          
          {/* Shop Col */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-foreground mb-6 uppercase tracking-wider text-sm">Shop</h3>
            <ul className="space-y-4">
              <li><Link href="/category/cosmetics" className="text-text-muted hover:text-accent-gold transition-colors text-sm">Luxury Cosmetics</Link></li>
              <li><Link href="/category/jewelry" className="text-text-muted hover:text-accent-gold transition-colors text-sm">Heritage Jewelry</Link></li>
              <li><Link href="/category/food" className="text-text-muted hover:text-accent-gold transition-colors text-sm">Gourmet Delicacies</Link></li>
              <li><Link href="/shop" className="text-text-muted hover:text-accent-gold transition-colors text-sm">All Collections</Link></li>
            </ul>
          </div>
          
          {/* Support Col */}
          <div className="lg:col-span-2">
            <h3 className="font-heading font-semibold text-foreground mb-6 uppercase tracking-wider text-sm">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/account" className="text-text-muted hover:text-accent-gold transition-colors text-sm">My Account</Link></li>
              <li><Link href="/orders" className="text-text-muted hover:text-accent-gold transition-colors text-sm">Order Tracking</Link></li>
              <li><Link href="/faq" className="text-text-muted hover:text-accent-gold transition-colors text-sm">FAQ & Help</Link></li>
              <li><Link href="/returns" className="text-text-muted hover:text-accent-gold transition-colors text-sm">Return Policy</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-4">
            <h3 className="font-heading font-semibold text-foreground mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-accent-gold shrink-0 mt-0.5" />
                <span className="text-text-muted text-sm leading-relaxed">123 Luxury Avenue, Gulberg III<br/>Lahore, Pakistan</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-accent-gold shrink-0" />
                <span className="text-text-muted text-sm">+92 300 1234567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-accent-gold shrink-0" />
                <span className="text-text-muted text-sm">support@fjstore.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-text-muted text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} FJ Store. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="text-sm text-text-muted hover:text-accent-gold transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-text-muted hover:text-accent-gold transition-colors">Terms of Service</Link>
            <Link href="/refunds" className="text-sm text-text-muted hover:text-accent-gold transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
