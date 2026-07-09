"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { createClient } from "@/lib/supabase/client";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { ShoppingBag, Star, ShieldCheck, Truck, Plus, Minus, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ProductContent({ product }: { product: any }) {
  const [selectedVariant, setSelectedVariant] = useState(product.product_variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const [canSubmitReview, setCanSubmitReview] = useState(false);
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null);
  const [reviewEligibilityLoading, setReviewEligibilityLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const { user } = useAuthStore();
  const supabase = createClient();
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

  useEffect(() => {
    if (!user) {
      setIsFavorite(false);
      setCanSubmitReview(false);
      setEligibleOrderId(null);
      return;
    }

    let mounted = true;
    async function loadFavoriteState() {
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
        console.error("Failed to load wishlist status", error);
      }
    }

    async function loadReviewEligibility() {
      setReviewEligibilityLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, status, order_items(product_id)")
          .eq("user_id", user.id)
          .eq("status", "Received")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const eligibleOrder = data?.find((order: any) =>
          order.order_items?.some((item: any) => item.product_id === product.id)
        );

        if (!eligibleOrder) {
          return;
        }

        const { data: existingReview, error: reviewError } = await supabase
          .from("reviews")
          .select("id, is_approved")
          .eq("product_id", product.id)
          .eq("user_id", user.id)
          .eq("order_id", eligibleOrder.id)
          .limit(1)
          .maybeSingle();

        if (reviewError) {
          throw reviewError;
        }

        if (mounted) {
          setEligibleOrderId(eligibleOrder.id);

          if (existingReview) {
            setCanSubmitReview(false);
            setReviewPending(true);
            setReviewMessage(
              existingReview.is_approved
                ? "You already submitted a review for this product. It is now visible on the page."
                : "Your review is already submitted and pending approval."
            );
          } else {
            setCanSubmitReview(true);
          }
        }
      } catch (error) {
        console.error("Failed to load review eligibility", error);
      } finally {
        if (mounted) setReviewEligibilityLoading(false);
      }
    }

    loadFavoriteState();
    loadReviewEligibility();

    return () => {
      mounted = false;
    };
  }, [product.id, supabase, user]);

  const handleSubmitReview = async () => {
    if (!user || !eligibleOrderId) {
      setReviewMessage("You must be signed in and have received this product to leave a review.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage("Please add a comment before submitting your review.");
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          orderId: eligibleOrderId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit review.");
      }

      setReviewComment("");
      setReviewRating(5);
      setReviewPending(true);
      setCanSubmitReview(false);
      setReviewMessage("Review submitted successfully and is pending approval.");
    } catch (error) {
      console.error("[REVIEW SUBMIT]", error);
      setReviewMessage(error instanceof Error ? error.message : "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

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
                onClick={async () => {
                  if (!user) {
                    window.location.href = "/login";
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
                    console.error("Wishlist toggle failed", error);
                  } finally {
                    setSavingFavorite(false);
                  }
                }}
                className="absolute top-4 left-4 p-3 bg-surface/80 dark:bg-white/10 hover:bg-surface transition-colors rounded-full backdrop-blur-sm"
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                disabled={savingFavorite}
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

          <div className="space-y-4 mb-10">
            {reviewEligibilityLoading ? (
              <div className="rounded-3xl border border-border bg-surface/50 p-6 text-center text-muted">
                Checking review eligibility...
              </div>
            ) : user ? (
              canSubmitReview ? (
                reviewPending ? (
                  <div className="rounded-3xl border border-accent-gold bg-accent-gold/10 p-6 text-center text-accent-gold">
                    Thank you! Your review has been submitted and is pending approval.
                  </div>
                ) : (
                  <Card className="rounded-3xl border border-accent-gold/20 bg-accent-gold/5">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground dark:text-foreground dark:text-white">
                          Leave a review for this product
                        </h3>
                        <p className="text-sm text-muted">You can submit a review after receiving this product.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground dark:text-foreground dark:text-white">Your Rating</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setReviewRating(value)}
                              className={`rounded-full p-2 transition-colors ${
                                reviewRating >= value
                                  ? "bg-accent-gold text-black"
                                  : "bg-surface border border-border text-muted hover:bg-accent-gold/10"
                              }`}
                            >
                              <Star size={18} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="reviewComment" className="text-sm font-medium text-foreground dark:text-foreground dark:text-white">
                          Your Review
                        </label>
                        <textarea
                          id="reviewComment"
                          value={reviewComment}
                          onChange={(event) => setReviewComment(event.target.value)}
                          rows={5}
                          className="w-full rounded-3xl border border-border bg-surface p-4 text-sm text-foreground dark:bg-surface/70 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-accent-gold"
                          placeholder="Tell us what you liked about the product and how it performed."
                        />
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted">
                          Reviews are moderated and published after approval.
                        </div>
                        <Button
                          onClick={handleSubmitReview}
                          disabled={reviewSubmitting}
                          className="self-start"
                        >
                          {reviewSubmitting ? "Submitting…" : "Submit Review"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <div className="rounded-3xl border border-border bg-surface/50 p-6 text-muted">
                  Reviews are available after you receive this product and your order is marked as Received.
                </div>
              )
            ) : (
              <div className="rounded-3xl border border-border bg-surface/50 p-6 text-center text-muted">
                <p className="mb-3">Sign in to submit a review once you receive this product.</p>
                <Link href="/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>
              </div>
            )}

            {reviewMessage && (
              <div className="rounded-3xl border border-border bg-surface/50 p-4 text-sm text-foreground dark:text-foreground dark:text-white">
                {reviewMessage}
              </div>
            )}
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
