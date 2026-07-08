"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { ShoppingBag, Star, ShieldCheck, Truck, Plus, Minus, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ProductContent({ product }: { product: any }) {
  const [selectedVariant, setSelectedVariant] = useState(product.product_variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const price = selectedVariant 
    ? (product.sale_price || product.regular_price) + selectedVariant.additional_price 
    : (product.sale_price || product.regular_price);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    alert("Added to cart!");
  };

  const mainImage = product.product_images?.[mainImageIndex]?.url;
  const discount = product.sale_price 
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  return (
    <>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-6 text-sm text-muted">
        <span className="hover:text-foreground dark:hover:text-foreground dark:text-white cursor-pointer">Home</span>
        <span className="mx-2">/</span>
        <span className="hover:text-foreground dark:hover:text-foreground dark:text-white cursor-pointer">{product.categories?.name}</span>
        <span className="mx-2">/</span>
        <span className="text-accent-gold">{product.name}</span>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-gray-200 to-gray-300 dark:from-surface dark:to-surface/50 border border-border dark:border-border group">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
              )}
              
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-foreground dark:text-white px-4 py-2 rounded-lg font-bold">
                  -{discount}%
                </div>
              )}

              {/* Favorite Button */}
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 left-4 p-3 bg-black/10 dark:bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
              >
                <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : "text-foreground dark:text-white"} />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {product.product_images && product.product_images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.product_images.map((img: any, idx: number) => (
                  <button
                    key={img.url}
                    onClick={() => setMainImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      mainImageIndex === idx
                        ? "border-accent-gold"
                        : "border-border dark:border-border hover:border-accent-gold dark:hover:border-white/30"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details Section */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex gap-2 mb-4">
                <Badge className="bg-accent-gold/20 text-accent-gold border-accent-gold/50">
                  {product.categories?.name}
                </Badge>
                {product.brand && (
                  <Badge variant="outline">{product.brand}</Badge>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground dark:text-foreground dark:text-white mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex text-accent-gold gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} fill="currentColor" />
                  ))}
                </div>
                <span className="text-muted">(128 reviews)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2 py-6 border-y border-border dark:border-border">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-foreground dark:text-foreground dark:text-white">
                  {formatCurrency(price)}
                </span>
                {product.sale_price && (
                  <span className="text-2xl text-muted line-through">
                    {formatCurrency(product.regular_price)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted">Free shipping on orders over PKR 10,000</p>
            </div>

            {/* Description */}
            <p className="text-muted leading-relaxed text-lg">{product.short_description}</p>

            {/* Variants */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground dark:text-white uppercase tracking-wide mb-3">
                    {product.product_variants[0].name}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.product_variants.map((v: any) => (
                      <button
                        key={v.value}
                        onClick={() => setSelectedVariant(v)}
                        className={`
                          px-4 py-3 rounded-lg font-medium transition-all border-2
                          ${selectedVariant?.value === v.value
                            ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                            : "border-border dark:border-white/20 text-muted hover:border-accent-gold dark:hover:border-white/40 hover:text-foreground dark:hover:text-foreground dark:text-white"
                          }
                        `}
                      >
                        {v.value}
                        {v.additional_price > 0 && (
                          <span className="text-xs ml-1">+{formatCurrency(v.additional_price)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border-2 border-border dark:border-white/20 rounded-xl overflow-hidden bg-surface/50 dark:bg-surface/50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-hover-bg dark:hover:bg-black/10 dark:bg-white/10 transition-colors text-muted hover:text-foreground dark:hover:text-foreground dark:text-white"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-6 py-3 font-bold text-foreground dark:text-foreground dark:text-white text-lg border-l border-r border-border dark:border-white/20">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-hover-bg dark:hover:bg-black/10 dark:bg-white/10 transition-colors text-muted hover:text-foreground dark:hover:text-foreground dark:text-white"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 py-3 text-lg font-bold shadow-lg hover:shadow-gold/20"
                >
                  <ShoppingBag className="mr-2" size={20} /> Add to Cart
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-3 bg-surface dark:bg-black/5 dark:bg-white/5 rounded-lg border border-border dark:border-border">
                  <ShieldCheck size={20} className="text-accent-gold" />
                  <div>
                    <p className="text-xs text-muted">100% Secure</p>
                    <p className="text-sm font-medium text-foreground dark:text-foreground dark:text-white">Checkout</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-surface dark:bg-black/5 dark:bg-white/5 rounded-lg border border-border dark:border-border">
                  <Truck size={20} className="text-accent-gold" />
                  <div>
                    <p className="text-xs text-muted">Fast</p>
                    <p className="text-sm font-medium text-foreground dark:text-foreground dark:text-white">Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="mt-20 pt-12 border-t border-border dark:border-border">
          <h2 className="text-3xl font-heading font-bold text-foreground dark:text-foreground dark:text-white mb-8">Product Details</h2>
          <Card className="bg-surface/50 border-border dark:border-border">
            <CardContent className="p-8 prose prose-invert max-w-none">
              {product.full_description ? (
                <div dangerouslySetInnerHTML={{ __html: product.full_description }} />
              ) : (
                <p className="text-muted">No detailed description available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-12 border-t border-border dark:border-border">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-heading font-bold text-foreground dark:text-foreground dark:text-white">
                Customer Reviews
              </h2>
              <p className="text-muted">Read verified feedback from real buyers.</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-accent-gold">
                {product.reviews && product.reviews.length > 0
                  ? (
                      product.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) /
                      product.reviews.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <p className="text-sm text-muted">{product.reviews?.length || 0} reviews</p>
            </div>
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="grid gap-6">
              {product.reviews.map((review: any) => (
                <Card key={review.id} className="bg-surface/50 border-border dark:border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div>
                        <div className="flex text-accent-gold gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Star
                              key={rating}
                              size={18}
                              fill={rating <= (review.rating || 0) ? "currentColor" : "none"}
                              className={rating <= (review.rating || 0) ? "text-accent-gold" : "text-muted"}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted mt-2">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : "Date unavailable"}
                        </p>
                      </div>
                      <Badge className="bg-accent-gold/10 text-accent-gold border-accent-gold/30">
                        Verified Buyer
                      </Badge>
                    </div>
                    <p className="text-lg text-foreground dark:text-foreground dark:text-white font-semibold mb-3">
                      {review.title || "Customer review"}
                    </p>
                    <p className="text-muted leading-relaxed">{review.comment || "No comment provided."}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-surface/50 p-8 text-center text-muted">
              No reviews have been submitted for this product yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
