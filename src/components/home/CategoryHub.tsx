"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  {
    id: "jewelry",
    title: "Heritage Bangles",
    subtitle: "Handcrafted Elegance",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-1",
    aspect: "aspect-[4/5]",
    bgImage: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "cosmetics",
    title: "Pakistani Beauty",
    subtitle: "Radiant Glow",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
    aspect: "aspect-[4/5] md:aspect-square lg:aspect-[4/5]",
    bgImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "food",
    title: "Desi Delights",
    subtitle: "Taste the Extraordinary",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-1",
    aspect: "aspect-[4/5] md:aspect-square lg:aspect-[4/5]",
    bgImage: "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?q=80&w=1200&auto=format&fit=crop",
  },
];

export function CategoryHub() {
  return (
    <section className="py-24 bg-transparent">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4"
          >
            Curated Collections
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "64px" }}
            viewport={{ once: true }}
            className="h-1 bg-accent-gold mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${cat.colSpan} ${cat.aspect}`}
            >
              {/* Background Image (Replacing placeholder) */}
              <div
                className={`absolute inset-0 group-hover:scale-110 transition-transform duration-700 ease-out bg-cover bg-center`}
                style={{ backgroundImage: `url(${cat.bgImage})` }}
              />

              {/* Blur Overlay & Darker gradient on hover */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500 group-hover:backdrop-blur-[2px]" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <h4 className="text-accent-gold text-sm uppercase tracking-wider mb-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {cat.subtitle}
                  </h4>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white font-heading mb-4">
                    {cat.title}
                  </h3>

                  <Link href="/shop">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 border-b border-white hover:border-accent-gold pb-1 text-sm font-medium hover:text-accent-gold inline-block">
                      Explore Now
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
