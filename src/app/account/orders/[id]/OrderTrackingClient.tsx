"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Download, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { generateAndDownloadInvoice, InvoiceData } from "@/lib/services/invoice";
import { createBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

const ORDER_STATUSES = [
  "Pending",
  "Paid",
  "Accepted",
  "Processing",
  "Shipped",
  "Delivered",
  "Received",
];

const getStatusIndex = (status: string) => {
  return ORDER_STATUSES.indexOf(status);
};

export default function OrderTrackingClient({ 
  order, 
  customerName, 
  customerEmail 
}: { 
  order: any, 
  customerName: string, 
  customerEmail: string 
}) {
  const [status, setStatus] = useState(order.status);
  const [markingReceived, setMarkingReceived] = useState(false);
  const currentIndex = getStatusIndex(status);
  const isCancelled = status === "Cancelled" || status === "Returned";
  const supabase = createBrowserClient();

  const handleDownloadInvoice = () => {
    const addressStr = order.addresses
      ? `${order.addresses.address_line_1}, ${order.addresses.city}, ${order.addresses.state || ""} ${order.addresses.country} ${order.addresses.postal_code || ""}`
      : "No address provided";

    const invoiceData: InvoiceData = {
      orderId: order.id,
      orderDate: order.created_at,
      customerName,
      customerEmail,
      shippingAddress: addressStr,
      items: order.order_items.map((item: any) => ({
        name: `${item.products?.name} ${item.product_variants ? `(${item.product_variants.name}: ${item.product_variants.value})` : ""}`,
        quantity: item.quantity,
        price: Number(item.price_at_time),
        total: Number(item.price_at_time) * item.quantity,
      })),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping_cost),
      discount: Number(order.discount),
      grandTotal: Number(order.total),
      status: order.status,
    };

    generateAndDownloadInvoice(invoiceData, order.user_id || "guest", supabase);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground dark:text-foreground dark:text-white">Order Details</h1>
          <p className="text-muted mt-1">Order #{order.id.substring(0, 8).toUpperCase()}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleDownloadInvoice} className="gap-2">
            <Download size={18} />
            Download Invoice & Delivery Slip
          </Button>
          <Link href="/account">
            <Button variant="secondary">Back to Account</Button>
          </Link>
        </div>
      </div>

      {/* Timeline Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isCancelled ? (
            <div className="p-6 text-center border border-error/20 bg-error/5 rounded-xl text-error font-medium">
              This order has been {status}.
            </div>
          ) : (
            <>
              <div className="relative pt-8 pb-4">
                <div className="absolute top-12 left-0 w-full h-1 bg-black/10 dark:bg-white/10 -z-10 rounded-full" />
                <div 
                  className="absolute top-12 left-0 h-1 bg-accent-gold -z-10 rounded-full transition-all duration-500" 
                  style={{ width: `${(Math.max(0, currentIndex) / (ORDER_STATUSES.length - 1)) * 100}%` }}
                />
                
                <div className="flex justify-between">
                  {ORDER_STATUSES.map((statusItem, index) => {
                    const isCompleted = index <= currentIndex;
                    
                    return (
                      <div key={statusItem} className="flex flex-col items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                          isCompleted ? "bg-accent-gold border-accent-gold text-black" : "bg-surface border-border dark:border-white/20 text-muted"
                        }`}>
                          {index === 0 && <Clock size={16} />}
                          {(index > 0 && index < 3) && <Package size={16} />}
                          {(index === 3 || index === 4) && <Truck size={16} />}
                          {index === 5 && <CheckCircle size={16} />}
                        </div>
                        <span className={`text-sm font-medium ${isCompleted ? "text-foreground dark:text-foreground dark:text-white" : "text-muted"}`}>
                          {statusItem}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

                      {status === "Delivered" && (
                <div className="mb-4 rounded-2xl border border-border bg-surface/70 p-5 text-sm text-foreground dark:text-foreground">
                  <p className="font-semibold mb-2">Confirm receipt</p>
                  <p className="text-muted mb-4">
                    Once your delivery arrives, click the button below to mark the order as <strong>Received</strong>.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      setMarkingReceived(true);
                      try {
                        const response = await fetch("/api/orders/status", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: order.id, newStatus: "Received" }),
                        });
                        const result = await response.json();
                        if (!response.ok || !result.success) {
                          throw new Error(result.error || "Unable to update order status.");
                        }
                        setStatus("Received");
                      } catch (error) {
                        console.error("[ORDER TRACKING] Mark received error", error);
                        alert(error instanceof Error ? error.message : "Failed to mark order as received.");
                      } finally {
                        setMarkingReceived(false);
                      }
                    }}
                    disabled={markingReceived}
                  >
                    {markingReceived ? "Updating…" : "Mark as Received"}
                  </Button>
                </div>
              )}

              {status === "Received" && (
                <div className="mb-4 rounded-2xl border border-accent-gold bg-accent-gold/5 p-5 text-sm text-foreground dark:text-foreground">
                  <p className="font-semibold mb-2">Thanks for confirming receipt</p>
                  <p className="text-muted mb-4">
                    Your order is now marked as <strong>Received</strong>. Please leave a review for the products you purchased.
                  </p>
                  <div className="grid gap-3">
                    {order.order_items.map((item: any) => {
                      const product = item.products;
                      const productUrl = product?.slug && product?.categories?.slug && product?.subcategories?.slug
                        ? `/shop/${product.categories.slug}/${product.subcategories.slug}/${product.slug}`
                        : null;

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border p-4 bg-white/75 dark:bg-black/40">
                          <div>
                            <p className="font-medium text-foreground dark:text-foreground dark:text-white">{product?.name || "Product"}</p>
                            <p className="text-xs text-muted">Thank you for receiving this item.</p>
                          </div>
                          {productUrl ? (
                            <Link href={productUrl} className="inline-flex items-center justify-center rounded-xl bg-accent-gold px-4 py-2 text-sm font-semibold text-black hover:bg-accent-gold/90">
                              Leave a review
                            </Link>
                          ) : (
                            <span className="text-sm text-muted">Review available on product page.</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-border dark:border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-foreground dark:text-foreground dark:text-white">{item.products?.name}</p>
                  {item.product_variants && (
                    <p className="text-xs text-muted mt-1">
                      {item.product_variants.name}: {item.product_variants.value}
                    </p>
                  )}
                  <p className="text-sm text-muted mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium text-foreground dark:text-foreground dark:text-white">
                  ${(Number(item.price_at_time) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-foreground dark:text-foreground dark:text-white">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="text-foreground dark:text-foreground dark:text-white">${Number(order.shipping_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span className="text-foreground dark:text-foreground dark:text-white">${Number(order.tax).toFixed(2)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-border dark:border-border/50 flex justify-between font-bold text-lg">
                <span className="text-foreground dark:text-foreground dark:text-white">Total</span>
                <span className="text-accent-gold">${Number(order.total).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted space-y-1">
              {order.addresses ? (
                <>
                  <p className="text-foreground dark:text-foreground dark:text-white font-medium">{customerName}</p>
                  <p>{order.addresses.address_line_1}</p>
                  {order.addresses.address_line_2 && <p>{order.addresses.address_line_2}</p>}
                  <p>
                    {order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}
                  </p>
                  <p>{order.addresses.country}</p>
                </>
              ) : (
                <p>No shipping address provided.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
