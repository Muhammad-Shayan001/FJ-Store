"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Product } from "@/lib/types/product";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  // Get thumbnail or first image - handle all possible image property names
  const imageUrl =
    product.images?.find((img) => img.is_thumbnail)?.url ||
    product.images?.[0]?.url ||
    null;

  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const productUrl = `/shop/${product.category?.slug || "category"}/${product.subcategory?.slug || "subcategory"}/${product.slug}`;

  const handleView = () => {
    router.push(productUrl);
  };

  const handleShop = () => {
    router.push("/shop");
  };

  useEffect(() => {
    if (!user) {
      setIsFavorite(false);
      return;
    }

    let mounted = true;
    async function loadWishlistStatus() {
      try {
        const { data } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .single();

        if (mounted) {
          setIsFavorite(!!data);
        }
      } catch (error) {
        console.error("Wishlist status load failed", error);
      }
    }

    loadWishlistStatus();
    return () => {
      mounted = false;
    };
  }, [product.id, supabase, user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:border-accent-gold transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {product.sale_price && (
          <span className="bg-accent-red text-foreground dark:text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
            Sale
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={async (event) => {
          event.stopPropagation();
          event.preventDefault();

          if (!user) {
            router.push("/login");
            return;
          }

          setSavingFavorite(true);
          try {
            if (isFavorite) {
              await supabase
                .from("wishlists")
                .delete()
                .eq("user_id", user.id)
                .eq("product_id", product.id);
              setIsFavorite(false);
            } else {
              await supabase.from("wishlists").insert({
                user_id: user.id,
                product_id: product.id,
              });
              setIsFavorite(true);
            }
          } catch (error) {
            console.error("Wishlist update failed", error);
          } finally {
            setSavingFavorite(false);
          }
        }}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-foreground hover:text-accent-red hover:bg-surface transition-colors"
        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        disabled={savingFavorite}
      >
        <Heart size={16} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
      </button>

      {/* Image Container */}
      <div className="relative w-full bg-gray-100" style={{ aspectRatio: "4/5" }}>
        {imageUrl ? (
          // Use regular img tag for all external URLs (Cloudinary, ImageKit, data-URLs)
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-surface to-background flex items-center justify-center">
            <span className="font-heading text-muted/20 text-2xl">FJ</span>
          </div>
        )}
        {/* Quick View Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 flex gap-2">
          <button
            onClick={handleView}
            className="flex-1 py-3 bg-foreground backdrop-blur text-background font-semibold rounded font-sans text-sm flex justify-center items-center gap-2 hover:bg-foreground/90 transition-colors"
          >
            <Search size={16} /> <span className="hidden sm:inline">View</span>
          </button>
          <button
            onClick={handleShop}
            className="flex-1 py-3 bg-accent-gold/90 backdrop-blur text-black font-semibold rounded font-sans text-sm flex justify-center items-center gap-2 hover:bg-accent-gold transition-colors"
          >
            <ShoppingBag size={16} /> <span className="hidden sm:inline">Shop</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="text-xs text-muted mb-2 uppercase tracking-wide">
          {product.category?.name || product.brand || "Luxury"}
        </div>
        <h3 className="text-foreground font-medium text-lg leading-tight mb-2 hover:text-accent-gold transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          {product.sale_price ? (
            <>
              <span className="text-accent-gold font-semibold">
                {formatCurrency(product.sale_price)}
              </span>
              <span className="text-muted line-through text-sm">
                {formatCurrency(product.regular_price)}
              </span>
            </>
          ) : (
            <span className="text-accent-gold font-semibold">
              {formatCurrency(product.regular_price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
