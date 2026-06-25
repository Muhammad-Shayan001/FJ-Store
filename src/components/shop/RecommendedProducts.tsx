"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price: number | null;
  image_url?: string;
  category_slug?: string;
  subcategory_slug?: string;
}

export default function RecommendedProducts({ title = "Recommended For You" }: { title?: string }) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchRecommended = async () => {
      // Fetch top-rated or recently-added published products as recommendations
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, regular_price, sale_price, categories(slug), subcategories(slug), product_images(url, is_thumbnail)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          regular_price: p.regular_price,
          sale_price: p.sale_price,
          image_url: p.product_images?.find((img: any) => img.is_thumbnail)?.url || p.product_images?.[0]?.url,
          category_slug: p.categories?.slug,
          subcategory_slug: p.subcategories?.slug,
        }));
        setProducts(mapped);
      }
      setLoading(false);
    };

    fetchRecommended();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-accent-gold" size={32} />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="text-accent-gold" size={24} />
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">{title}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const href = product.category_slug && product.subcategory_slug
              ? `/shop/${product.category_slug}/${product.subcategory_slug}/${product.slug}`
              : `/product/${product.slug}`;

            return (
              <Link key={product.id} href={href} className="group">
                <div className="bg-surface border border-border rounded-xl overflow-hidden hover:border-accent-gold transition-all duration-300">
                  <div className="relative aspect-4/5 bg-background">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <span className="font-heading text-muted/20 text-xl">FJ</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-foreground font-medium text-sm line-clamp-1 group-hover:text-accent-gold transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {product.sale_price ? (
                        <>
                          <span className="text-accent-gold font-semibold text-sm">{formatCurrency(product.sale_price)}</span>
                          <span className="text-muted line-through text-xs">{formatCurrency(product.regular_price)}</span>
                        </>
                      ) : (
                        <span className="text-accent-gold font-semibold text-sm">{formatCurrency(product.regular_price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
