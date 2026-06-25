"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "../shop/ProductCard";
import { Product } from "@/lib/types/product";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  type: "featured" | "newest" | "bestsellers";
}

export function ProductCarousel({ title, subtitle, type }: ProductCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select(`*, images:product_images(*), category:categories(*)`)
        .eq("is_published", true)
        .limit(4);

      if (type === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (type === "featured" || type === "bestsellers") {
        // Mock random order or best sellers via something else.
        // For demonstration, order by price or stock.
        query = query.order(type === "bestsellers" ? "stock_quantity" : "regular_price", {
          ascending: false,
        });
      }

      const { data } = await query;
      if (data) {
        setProducts(data as unknown as Product[]);
      }
      setLoading(false);
    }
    loadProducts();
  }, [type]);

  if (loading) return null; // or skeleton
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">{title}</h2>
            {subtitle && <p className="text-muted">{subtitle}</p>}
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-2 text-accent-gold hover:text-foreground transition-colors"
          >
            <span className="text-sm font-semibold tracking-wider uppercase">View All</span>
            <ChevronRight
              size={18}
              className="transform group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
