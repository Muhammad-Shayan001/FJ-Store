import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <BrandLogo width={180} height={48} />
            </Link>
            <p className="text-text-muted max-w-sm">
              Discover a curated selection of premium cosmetics, elegant jewelry, and exquisite delicacies designed for a sophisticated lifestyle.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/category/cosmetics" className="text-text-muted hover:text-accent-gold transition-colors">Cosmetics</Link></li>
              <li><Link href="/category/jewelry" className="text-text-muted hover:text-accent-gold transition-colors">Jewelry</Link></li>
              <li><Link href="/category/food" className="text-text-muted hover:text-accent-gold transition-colors">Delicacies</Link></li>
              <li><Link href="/products" className="text-text-muted hover:text-accent-gold transition-colors">All Products</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/account" className="text-text-muted hover:text-accent-gold transition-colors">My Account</Link></li>
              <li><Link href="/orders" className="text-text-muted hover:text-accent-gold transition-colors">Order Tracking</Link></li>
              <li><Link href="/faq" className="text-text-muted hover:text-accent-gold transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-text-muted hover:text-accent-gold transition-colors">Contact Us</Link></li>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
