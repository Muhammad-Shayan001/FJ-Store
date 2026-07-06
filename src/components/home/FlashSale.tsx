"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock, Zap } from "lucide-react";
import { ProductCard } from "../shop/ProductCard";

// Mock products for flash sale demonstration
const flashProducts = [
  {
    id: "fs-1",
    name: "Lumière Gold Serum",
    slug: "lumiere-gold-serum",
    price: 150000,
    salePrice: 85000,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
    category: "Cosmetics",
    brand: "FJ Beauty",
    rating: 4.9,
    reviews: 128
  },
  {
    id: "fs-2",
    name: "Royal Polki Set",
    slug: "royal-polki-set",
    price: 450000,
    salePrice: 310000,
    image: "https://images.unsplash.com/photo-1599643478524-fb66f70a00ea?q=80&w=800&auto=format&fit=crop",
    category: "Jewelry",
    brand: "Heritage",
    rating: 5.0,
    reviews: 45
  },
  {
    id: "fs-3",
    name: "Artisan Saffron Truffles",
    slug: "artisan-saffron-truffles",
    price: 12000,
    salePrice: 8500,
    image: "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?q=80&w=800&auto=format&fit=crop",
    category: "Food",
    brand: "FJ Gourmet",
    rating: 4.8,
    reviews: 210
  }
];

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 }; // Loop for demo
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-surface border-y border-border/50">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/5 via-background to-accent-gold/5 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Sale Info */}
          <div className="w-full lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-background border border-accent-gold/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 text-accent-gold/5 pointer-events-none">
                <Zap size={150} />
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                <Zap size={14} className="fill-current" />
                Limited Time Offer
              </div>
              
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
                Flash <span className="text-accent-gold">Sale</span>
              </h2>
              
              <p className="text-text-muted mb-8 leading-relaxed">
                Exclusive discounts on our most sought-after luxury pieces. Once the timer hits zero, these offers disappear forever.
              </p>

              {/* Timer */}
              <div className="flex gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center text-2xl font-bold font-mono text-foreground shadow-inner">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <span className="text-xs text-text-muted mt-2 font-medium uppercase tracking-wider">Hours</span>
                </div>
                <div className="text-3xl font-bold text-accent-gold mt-3">:</div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center text-2xl font-bold font-mono text-foreground shadow-inner">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <span className="text-xs text-text-muted mt-2 font-medium uppercase tracking-wider">Mins</span>
                </div>
                <div className="text-3xl font-bold text-accent-gold mt-3">:</div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-500 border border-red-400 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <span className="text-xs text-text-muted mt-2 font-medium uppercase tracking-wider text-red-500">Secs</span>
                </div>
              </div>

              <Link href="/shop/flash-sale" className="group inline-flex items-center justify-center w-full py-4 bg-foreground text-background font-medium rounded-xl hover:bg-accent-gold transition-colors">
                View All Deals
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Products */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductCard product={product as any} />
                </motion.div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
