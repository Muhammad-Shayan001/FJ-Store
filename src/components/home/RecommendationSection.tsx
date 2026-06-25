"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { Loader2 } from "lucide-react";

export default function RecommendationSection({
  userId,
  category,
  viewedProducts,
  purchaseHistory,
  title = "Recommended For You",
}: {
  userId?: string;
  category?: string;
  viewedProducts?: string[];
  purchaseHistory?: string[];
  title?: string;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/ai/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            category,
            viewedProducts: viewedProducts?.join(", "),
            purchaseHistory: purchaseHistory?.join(", "),
            limit: 6,
          }),
        });
        const data = await res.json();
        setProducts(data.recommendations || []);
        setReason(data.reason || "");
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchRecommendations();
  }, [userId, category]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin text-accent-gold" />
            <p className="text-muted">Loading recommendations...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            ✨ {title}
          </h2>
          {reason && <p className="text-muted text-sm">{reason}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
