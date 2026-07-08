"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock, MapPin, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { sendInvoiceEmail, sendOrderConfirmationEmail } from "@/lib/services/emailHelper";
import { PageContainer } from "@/components/layout/PageContainer";

type Step = "shipping" | "delivery" | "payment" | "review";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, subtotal, shipping: defaultShipping, discount, total, clearCart } = useCartStore();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"cod">("cod");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  });
  const [addressSaveError, setAddressSaveError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    // If cart empty, kick out
    if (!loading && items.length === 0) {
      router.push("/cart");
    }
  }, [items, loading, router]);

  useEffect(() => {
    async function loadData() {
      if (user) {
        const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id);
        if (data) {
          setAddresses(data);
          const def = data.find((c) => c.is_default);
          if (def) setSelectedAddressId(def.id);
          else if (data.length > 0) setSelectedAddressId(data[0].id);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: "shipping", label: "Shipping", icon: MapPin },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const calculateShipping = () => {
    return deliveryMethod === "express" ? 25 : defaultShipping;
  };

  const finalTotal = subtotal + calculateShipping() - discount;

  const handleAddressFormChange = (field: string, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAddress = async () => {
    setAddressSaveError(null);
    setSavingAddress(true);

    if (!user) {
      setAddressSaveError("Please sign in to save a shipping address.");
      setSavingAddress(false);
      return;
    }

    if (!addressForm.address_line_1 || !addressForm.city || !addressForm.country) {
      setAddressSaveError("Street address, city, and country are required.");
      setSavingAddress(false);
      return;
    }

    try {
      const { data: newAddress, error } = await supabase
        .from("addresses")
        .insert([
          {
            user_id: user.id,
            title: addressForm.title,
            address_line_1: addressForm.address_line_1,
            address_line_2: addressForm.address_line_2,
            city: addressForm.city,
            state: addressForm.state,
            country: addressForm.country,
            postal_code: addressForm.postal_code,
            is_default: addresses.length === 0,
          },
        ])
        .select()
        .single();

      if (error || !newAddress) {
        throw error || new Error("Unable to save address.");
      }

      const updated = [...addresses, newAddress];
      setAddresses(updated);
      setSelectedAddressId(newAddress.id);
      setShowAddressForm(false);
      setAddressForm({
        title: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
      });
    } catch (err) {
      console.error("Save address error", err);
      setAddressSaveError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddressId) return;
    setPlacingOrder(true);
    try {
      // Create master order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          address_id: selectedAddressId,
          status: "Pending",
          subtotal,
          tax: 0, // Simplified
          shipping_cost: calculateShipping(),
          discount,
          total: finalTotal,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create Order Items
      const orderItemsInsert = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant?.id || null,
        quantity: item.quantity,
        price_at_time: item.product.sale_price || item.product.regular_price,
      }));

      await supabase.from("order_items").insert(orderItemsInsert);

      // Create abstract payment log
      await supabase.from("payments").insert({
        order_id: order.id,
        transaction_id: `txn_mock_${Math.random().toString(36).substr(2, 9)}`,
        provider: paymentMethod,
        status: paymentMethod === "cod" ? "pending" : "succeeded",
        amount: finalTotal,
      });

      // Send Order Confirmation Email
      const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
      const shippingAddress = selectedAddress
        ? `${selectedAddress.address_line_1}${selectedAddress.address_line_2 ? ", " + selectedAddress.address_line_2 : ""}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postal_code}, ${selectedAddress.country}`
        : "No address provided";

      const emailSent = await sendOrderConfirmationEmail(
        user.email || "",
        user.user_metadata?.full_name || "Valued Customer",
        order.id,
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        items.map((item) => ({
          name: `${item.product.name}${item.variant ? ` (${item.variant.name}: ${item.variant.value})` : ""}`,
          quantity: item.quantity,
          price: item.product.sale_price || item.product.regular_price,
        })),
        subtotal,
        calculateShipping(),
        0,
        discount,
        finalTotal,
        shippingAddress
      );

      if (emailSent) {
        console.log("[CHECKOUT] Order confirmation email sent successfully");
      } else {
        console.warn("[CHECKOUT] Order confirmation email failed to send (order still placed)");
      }

      const invoiceSent = await sendInvoiceEmail(
        user.email || "",
        user.user_metadata?.full_name || "Valued Customer",
        order.id,
        subtotal,
        calculateShipping(),
        0,
        discount,
        finalTotal
      );

      if (invoiceSent) {
        console.log("[CHECKOUT] Invoice email sent successfully");
      } else {
        console.warn("[CHECKOUT] Invoice email failed to send");
      }

      clearCart();
      router.push(`/account?success=order_placed`);
    } catch (err) {
      console.error("Order error", err);
      alert("Failed to place order.");
    }
    setPlacingOrder(false);
  };

  if (loading) return null; // Pre-render blank vs skeleton

  return (
    <PageContainer maxWidth="xl">
        <Link
          href="/cart"
          className="inline-flex items-center text-muted hover:text-foreground dark:hover:text-foreground dark:text-white mb-8 transition-colors text-sm"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-heading font-bold text-foreground dark:text-foreground dark:text-white mb-10">Secure Checkout</h1>

        {/* Steps Header */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-border dark:bg-black/10 dark:bg-white/10 -z-10"></div>
          {steps.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStepIndex > idx;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-accent-gold text-black border-2 border-accent-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                      : isCompleted
                        ? "bg-success text-foreground dark:text-white border-2 border-success"
                        : "bg-surface text-muted border-2 border-border dark:border-border"
                  }`}
                >
                  {isCompleted ? <Check size={18} /> : <StepIcon size={18} />}
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider hidden sm:block ${isActive ? "text-accent-gold" : isCompleted ? "text-success" : "text-muted"}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              {/* SHIPPING STEP */}
              {currentStep === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-heading font-medium text-foreground dark:text-foreground dark:text-white mb-4">
                    Select Shipping Address
                  </h2>
                  {addresses.length === 0 ? (
                    <div className="bg-surface/50 border border-border dark:border-border/50 p-8 rounded-2xl text-center">
                      <p className="text-muted mb-4">No addresses found.</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="bg-accent-gold text-black px-4 py-2 rounded-lg hover:bg-accent-gold/90 transition-colors"
                      >
                        Add New Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id ? "border-accent-gold bg-accent-gold/5" : "border-border bg-surface/30 hover:border-white/30"}`}
                          >
                            <div className="font-semibold text-foreground dark:text-white mb-1">
                              {addr.title || "Address"}{" "}
                              {addr.is_default && (
                                <span className="text-[10px] ml-2 bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded text-muted">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted">
                              <p>{addr.address_line_1}</p>
                              {addr.address_line_2 && <p>{addr.address_line_2}</p>}
                              <p>
                                {addr.city}, {addr.state} {addr.postal_code}
                              </p>
                              <p>{addr.country}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="w-full sm:w-auto bg-accent-gold text-black px-6 py-3 rounded-xl font-semibold hover:bg-accent-gold/90 transition-colors"
                      >
                        Add New Address
                      </button>
                    </div>
                  )}

                  {showAddressForm && (
                    <div className="space-y-4 p-6 rounded-2xl border border-border bg-surface">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground dark:text-white">New Shipping Address</h3>
                          <p className="text-sm text-muted">Fill in the address to save and use for checkout.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="text-sm text-muted hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-sm text-muted">
                          <span>Title</span>
                          <input
                            value={addressForm.title}
                            onChange={(e) => handleAddressFormChange("title", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                            placeholder="Home, Office, etc."
                          />
                        </label>
                        <label className="space-y-2 text-sm text-muted">
                          <span>Country</span>
                          <input
                            value={addressForm.country}
                            onChange={(e) => handleAddressFormChange("country", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                            placeholder="Country"
                          />
                        </label>
                      </div>

                      <label className="space-y-2 text-sm text-muted">
                        <span>Street Address</span>
                        <input
                          value={addressForm.address_line_1}
                          onChange={(e) => handleAddressFormChange("address_line_1", e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                          placeholder="123 Main St"
                        />
                      </label>

                      <label className="space-y-2 text-sm text-muted">
                        <span>Address Line 2</span>
                        <input
                          value={addressForm.address_line_2}
                          onChange={(e) => handleAddressFormChange("address_line_2", e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                          placeholder="Apartment, suite, unit, building, floor, etc."
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-sm text-muted">
                          <span>City</span>
                          <input
                            value={addressForm.city}
                            onChange={(e) => handleAddressFormChange("city", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                            placeholder="City"
                          />
                        </label>
                        <label className="space-y-2 text-sm text-muted">
                          <span>State</span>
                          <input
                            value={addressForm.state}
                            onChange={(e) => handleAddressFormChange("state", e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                            placeholder="State / Province"
                          />
                        </label>
                      </div>

                      <label className="space-y-2 text-sm text-muted">
                        <span>Postal Code</span>
                        <input
                          value={addressForm.postal_code}
                          onChange={(e) => handleAddressFormChange("postal_code", e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20"
                          placeholder="Postal Code"
                        />
                      </label>

                      {addressSaveError && <p className="text-sm text-red-500">{addressSaveError}</p>}

                      <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="rounded-xl border border-border bg-surface px-5 py-3 text-sm text-foreground hover:border-white/30 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAddress}
                          disabled={savingAddress}
                          className="rounded-xl bg-accent-gold px-5 py-3 text-sm font-semibold text-black hover:bg-accent-gold/90 transition-colors disabled:opacity-50"
                        >
                          {savingAddress ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-8">
                    <button
                      onClick={() => setCurrentStep("delivery")}
                      disabled={!selectedAddressId}
                      className="bg-accent-gold text-black px-8 py-3 rounded-xl font-semibold hover:bg-accent-gold/90 transition-colors disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* DELIVERY STEP */}
              {currentStep === "delivery" && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-heading font-medium text-foreground dark:text-foreground dark:text-white mb-4">
                    Delivery Method
                  </h2>
                  <div className="space-y-4">
                    <label
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${deliveryMethod === "standard" ? "border-accent-gold bg-accent-gold/5" : "border-border dark:border-border bg-surface/30 hover:border-accent-gold dark:hover:border-white/30"}`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === "standard"}
                          onChange={() => setDeliveryMethod("standard")}
                          className="accent-accent-gold"
                        />
                        <div>
                          <div className="font-semibold text-foreground dark:text-foreground dark:text-white">Standard Delivery</div>
                          <div className="text-sm text-muted">3-5 business days</div>
                        </div>
                      </div>
                      <div className="font-semibold text-foreground dark:text-foreground dark:text-white">{formatCurrency(defaultShipping)}</div>
                    </label>

                    <label
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${deliveryMethod === "express" ? "border-accent-gold bg-accent-gold/5" : "border-border dark:border-border bg-surface/30 hover:border-accent-gold dark:hover:border-white/30"}`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === "express"}
                          onChange={() => setDeliveryMethod("express")}
                          className="accent-accent-gold"
                        />
                        <div>
                          <div className="font-semibold text-foreground dark:text-foreground dark:text-white">Express Delivery</div>
                          <div className="text-sm text-muted">1-2 business days</div>
                        </div>
                      </div>
                      <div className="font-semibold text-foreground dark:text-foreground dark:text-white">{formatCurrency(2500)}</div>
                    </label>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep("shipping")}
                      className="text-muted hover:text-foreground dark:hover:text-foreground dark:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep("payment")}
                      className="bg-accent-gold text-black px-8 py-3 rounded-xl font-semibold hover:bg-accent-gold/90 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* PAYMENT STEP */}
              {currentStep === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={18} className="text-success" />
                    <h2 className="text-xl font-heading font-medium text-foreground dark:text-foreground dark:text-white">Secure Payment</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center p-4 rounded-xl border border-accent-gold bg-accent-gold/5 transition-all">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mr-4 accent-accent-gold"
                      />
                      <div className="flex-1 font-semibold text-foreground dark:text-foreground dark:text-white">Cash on Delivery</div>
                    </label>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep("delivery")}
                      className="text-muted hover:text-foreground dark:hover:text-foreground dark:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep("review")}
                      className="bg-accent-gold text-black px-8 py-3 rounded-xl font-semibold hover:bg-accent-gold/90 transition-colors"
                    >
                      Review Order
                    </button>
                  </div>
                </motion.div>
              )}

              {/* REVIEW STEP */}
              {currentStep === "review" && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <h2 className="text-xl font-heading font-medium text-foreground dark:text-white mb-2">Order Review</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-surface/30 border border-border/50 p-4 rounded-xl">
                      <div className="text-xs text-muted uppercase tracking-wider mb-2">
                        Shipping to
                      </div>
                      <div className="text-sm text-foreground dark:text-foreground dark:text-white">
                        {addresses.find((a) => a.id === selectedAddressId)?.address_line_1}
                        <br />
                        {addresses.find((a) => a.id === selectedAddressId)?.city},{" "}
                        {addresses.find((a) => a.id === selectedAddressId)?.country}
                      </div>
                      <button
                        onClick={() => setCurrentStep("shipping")}
                        className="text-accent-gold text-xs mt-2 hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="bg-surface/30 border border-border dark:border-border/50 p-4 rounded-xl">
                      <div className="text-xs text-muted uppercase tracking-wider mb-2">
                        Payment Style
                      </div>
                      <div className="text-sm text-foreground dark:text-foreground dark:text-white uppercase">{paymentMethod}</div>
                      <button
                        onClick={() => setCurrentStep("payment")}
                        className="text-accent-gold text-xs mt-2 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface/30 border border-border dark:border-border/50 rounded-xl p-4 space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-background rounded overflow-hidden">
                            {item.product.images?.[0]?.url && (
                              <img
                                src={item.product.images[0].url}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-foreground dark:text-foreground dark:text-white">{item.product.name}</div>
                            <div className="text-xs text-muted">
                              Qty: {item.quantity}{" "}
                              {item.variant && `| ${item.variant.name}: ${item.variant.value}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-foreground dark:text-foreground dark:text-white font-medium">
                          {formatCurrency(
                            ((item.product.sale_price || item.product.regular_price) + (item.variant?.additional_price || 0)) *
                            item.quantity
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep("payment")}
                      className="text-muted hover:text-foreground dark:hover:text-foreground dark:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder}
                      className="bg-accent-gold text-black px-8 py-3 rounded-xl font-semibold hover:bg-accent-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {placingOrder ? "Processing..." : "Place Order"} <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky Overview */}
          <div className="lg:w-1/3">
            <div className="bg-surface/80 backdrop-blur-xl border border-border dark:border-border/50 rounded-2xl p-6 sticky top-32">
              <h2 className="font-heading font-medium text-foreground dark:text-foreground dark:text-white mb-4">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-foreground dark:text-foreground dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="text-foreground dark:text-foreground dark:text-white">
                    {calculateShipping() === 0 ? "Free" : formatCurrency(calculateShipping())}
                  </span>
                </div>
                <div className="h-px w-full bg-border dark:bg-black/10 dark:bg-white/10 my-2"></div>
                <div className="flex justify-between text-lg font-medium">
                  <span className="text-foreground dark:text-foreground dark:text-white">Total</span>
                  <span className="text-accent-gold">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </PageContainer>
  );
}
