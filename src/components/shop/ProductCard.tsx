"use client";

import { motion } from "framer-motion";
import { Product } from "@/lib/types/product";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  // Get thumbnail or first image - handle all possible image property names
  const imageUrl =
    product.images?.find((img) => img.is_thumbnail)?.url ||
    product.images?.[0]?.url ||
    null;

  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    router.push("/shop");
  };

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
      <button className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-surface/50 backdrop-blur-md flex items-center justify-center text-foreground hover:text-accent-red hover:bg-surface transition-colors">
        <Heart size={16} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-4/5 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transform group-hover:scale-105 transition-transform duration-700"
            priority={false}
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
            onClick={() => router.push("/shop")}
            className="flex-1 py-3 bg-foreground backdrop-blur text-background font-semibold rounded font-sans text-sm flex justify-center items-center gap-2 hover:bg-foreground/90 transition-colors"
          >
            <Search size={16} /> <span className="hidden sm:inline">View</span>
          </button>
          <button
            onClick={handleAddToCart}
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
