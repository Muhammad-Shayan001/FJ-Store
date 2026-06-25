"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, Bookmark, Tag, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    savedItems,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    subtotal,
    shipping,
    discount,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore();
  const { user } = useAuthStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponStatus("Loading...");
    const result = await applyCoupon(couponCode);
    if (result === "success") {
      setCouponStatus("Coupon applied successfully!");
      setCouponCode("");
    } else if (result === "min_not_met") {
      setCouponStatus("Minimum order amount not met for this coupon.");
    } else {
      setCouponStatus("Invalid or expired coupon code.");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <h1 className="text-4xl font-heading font-bold text-foreground dark:text-white mb-10">Shopping Bag</h1>

      <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="lg:w-2/3">
            <div className="space-y-6">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center text-muted border border-border/50 rounded-2xl bg-surface/30"
                  >
                    Your shopping bag is empty.
                    <div className="mt-6">
                      <Link href="/shop" className="text-accent-gold hover:underline">
                        Continue Shopping
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  items.map((item) => {
                    const price = item.product.sale_price || item.product.regular_price;
                    const variantPrice = item.variant?.additional_price || 0;
                    const finalPrice = price + variantPrice;
                    const thumb =
                      item.product.images?.find((i) => i.is_thumbnail)?.url ||
                      item.product.images?.[0]?.url;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-6 bg-surface/50 p-4 rounded-2xl border border-border/50"
                      >
                        {/* Image */}
                        <div className="w-24 h-32 bg-background rounded-xl overflow-hidden shrink-0">
                          {thumb ? (
                            <img
                              src={thumb}
                              className="w-full h-full object-cover"
                              alt={item.product.name}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              No Img
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link
                                href={`/product/${item.product.slug}`}
                                className="text-lg font-medium text-foreground dark:text-white hover:text-accent-gold transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              {item.variant && (
                                <p className="text-sm text-muted mt-1">
                                  {item.variant.name}: {item.variant.value}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => saveForLater(item.id)}
                                className="text-muted hover:text-foreground dark:text-white transition-colors p-2"
                                title="Save for later"
                              >
                                <Bookmark size={18} />
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-muted hover:text-error transition-colors p-2"
                                title="Remove"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-end">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-background rounded-lg border border-border p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-foreground dark:text-white hover:bg-black/10 dark:bg-white/10 rounded transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center text-foreground dark:text-white font-medium text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-foreground dark:text-white hover:bg-black/10 dark:bg-white/10 rounded transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="text-accent-gold font-semibold">
                                {formatCurrency(finalPrice * item.quantity)}
                              </div>
                              <div className="text-xs text-muted">
                                {formatCurrency(finalPrice)} each
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Saved For Later Section */}
            {savedItems.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-heading font-medium text-foreground dark:text-white mb-6">
                  Saved for Later
                </h2>
                <div className="space-y-4">
                  {savedItems.map((item) => {
                    const price = item.product.sale_price || item.product.regular_price;
                    const variantPrice = item.variant?.additional_price || 0;
                    const finalPrice = price + variantPrice;
                    const thumb =
                      item.product.images?.find((i) => i.is_thumbnail)?.url ||
                      item.product.images?.[0]?.url;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 bg-surface/30 p-4 rounded-xl border border-border/50 opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <div className="w-16 h-20 bg-background rounded-lg overflow-hidden shrink-0">
                          {thumb ? (
                            <img src={thumb} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="text-base font-medium text-foreground dark:text-white"
                          >
                            {item.product.name}
                          </Link>
                          {item.variant && (
                            <p className="text-xs text-muted mt-1">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                          <div className="text-accent-gold font-semibold text-sm mt-1">
                            {formatCurrency(finalPrice)}
                          </div>
                        </div>
                        <div className="flex flex-col justify-end">
                          <button
                            onClick={() => moveToCart(item.id)}
                            className="text-accent-blue text-sm hover:underline"
                          >
                            Move to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="lg:w-1/3">
              <div className="bg-surface/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 sticky top-32">
                <h2 className="text-xl font-heading font-medium text-foreground dark:text-white mb-6">Order Summary</h2>

                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal</span>
                    <span className="text-foreground dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount ({coupon?.code})</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted">
                    <span>Shipping</span>
                    <span className="text-foreground dark:text-white">
                      {shipping === 0 ? "Free" : formatCurrency(shipping)}
                    </span>
                  </div>

                  <div className="h-px w-full bg-black/10 dark:bg-white/10 my-2"></div>
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-foreground dark:text-white">Total</span>
                    <span className="text-accent-gold">{formatCurrency(total)}</span>
                  </div>
                </div>

                {!user && (
                  <div className="mb-4 text-center text-xs text-muted bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-border">
                    You are checking out as a guest.{" "}
                    <Link
                      href="/login?redirect=/checkout"
                      className="text-accent-gold hover:underline"
                    >
                      Log in
                    </Link>{" "}
                    to save this order to your account.
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  className="w-full bg-accent-gold text-black font-semibold py-4 rounded-xl hover:bg-accent-gold/90 transition-colors flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <div className="mt-8 border-t border-border/50 pt-6">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-success/10 border border-success/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-success">
                        <Tag size={16} />
                        <span className="font-medium">{coupon.code} Applied</span>
                      </div>
                      <button onClick={removeCoupon} className="text-muted hover:text-foreground dark:text-white">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-4 text-sm text-foreground dark:text-white focus:outline-none focus:border-accent-blue"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="px-4 bg-black/5 dark:bg-white/5 text-foreground dark:text-white text-sm font-medium rounded-lg hover:bg-black/10 dark:bg-white/10 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {couponStatus && (
                        <p
                          className={`text-xs ${couponStatus.includes("successfully") ? "text-success" : "text-error"}`}
                        >
                          {couponStatus}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
    </PageContainer>
  );
}
