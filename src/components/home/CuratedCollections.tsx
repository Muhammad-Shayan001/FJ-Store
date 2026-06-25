"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types/product";
import { ProductCard } from "@/components/shop/ProductCard";

interface CuratedCollectionsProps {
  title: string;
  subtitle: string;
  type: "featured" | "newest";
}

export function CuratedCollections({ title, subtitle, type }: CuratedCollectionsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const supabase = createClient();
        const query = supabase
          .from("products")
          .select(`*, images:product_images(*), category:categories(*)`)
          .eq("is_published", true)
          .limit(4);

        const { data, error } = await query;

        if (!isMounted) return;

        if (!error && data) {
          setProducts((data as Product[]).filter(Boolean));
        }
      } catch {
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [type]);

  const sectionLabel = useMemo(() => (type === "featured" ? "Curated Collections" : "A Legacy of Excellence"), [type]);

  if (loading) {
    return null;
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="border-t border-border/70 bg-background/70 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent-gold backdrop-blur dark:bg-[#121212]/80">
              <Sparkles className="h-3.5 w-3.5" />
              {sectionLabel}
            </div>
            <h2 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
            <p className="text-lg text-text-secondary">{subtitle}</p>
          </div>

          <Link href="/shop" className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent-gold transition hover:text-foreground">
            Discover More
            <ArrowRight size={16} className="transition group-hover:translate-x-1" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, staggerChildren: 0.08 }}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {products.map((product) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
