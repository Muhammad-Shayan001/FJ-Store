"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import { ArrowLeft, RefreshCw, Printer } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { generateAndDownloadInvoice, generateAndDownloadDeliverySlip, InvoiceData } from "@/lib/services/invoice";

const ORDER_STATUSES = [
  "Pending",
  "Accepted",
  "Processing",
  "Shipped",
  "Delivered",
  "Received",
  "Cancelled",
  "Returned"
];

interface OrderItemLike {
  id?: string;
  quantity?: number;
  price_at_time?: number | string;
  products?: { name?: string | null } | null;
  product_variants?: { name?: string; value?: string } | null;
}

interface OrderAddressLike {
  address_line_1?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

interface OrderLike {
  id: string;
  status?: string;
  created_at: string;
  subtotal?: number | string;
  tax?: number | string;
  shipping_cost?: number | string;
  discount?: number | string;
  total?: number | string;
  user_id?: string;
  addresses?: OrderAddressLike | null;
  order_items?: OrderItemLike[] | null;
  user?: { full_name?: string | null; email?: string | null } | null;
}

export default function AdminOrderDetailsClient({ order }: { order: OrderLike }) {
  const safeOrder = order || {};
  const [status, setStatus] = useState(safeOrder.status || "Pending");
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, newStatus }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to update order status.");
      }

      setStatus(newStatus);
      console.log(`[ADMIN ORDER] Order ${order.id} status updated to ${newStatus}`);
    } catch (error) {
      console.error("[ADMIN ORDER] Status update error", error);
      alert(error instanceof Error ? error.message : "Failed to update order status.");
    } finally {
      setLoading(false);
    }
  };

  const addressStr = order.addresses
    ? `${order.addresses.address_line_1}, ${order.addresses.city}, ${order.addresses.state || ""} ${order.addresses.country} ${order.addresses.postal_code || ""}`
    : "No address provided";

  const invoiceData: InvoiceData = {
    orderId: safeOrder.id,
    orderDate: safeOrder.created_at,
    customerName: safeOrder.user?.full_name || "Guest",
    customerEmail: safeOrder.user?.email || "",
    shippingAddress: addressStr,
    deliveryAddress: addressStr,
    items: (safeOrder.order_items || []).map((item: OrderItemLike) => ({
      name: `${item.products?.name} ${item.product_variants ? `(${item.product_variants.name}: ${item.product_variants.value})` : ""}`,
      quantity: item.quantity || 0,
      price: Number(item.price_at_time || 0),
      total: Number(item.price_at_time || 0) * (item.quantity || 0),
    })),
    subtotal: Number(safeOrder.subtotal || 0),
    tax: Number(safeOrder.tax || 0),
    shipping: Number(safeOrder.shipping_cost || 0),
    discount: Number(safeOrder.discount || 0),
    grandTotal: Number(safeOrder.total || 0),
    status: safeOrder.status,
  };

  const handleDownloadInvoice = () => {
    generateAndDownloadInvoice(invoiceData, order.user_id || "guest", supabase);
  };

  const handleDownloadDeliverySlip = () => {
    generateAndDownloadDeliverySlip(invoiceData, order.user_id || "guest", supabase);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground dark:text-white mb-1">
              Order #{order.id.split("-")[0].toUpperCase()}
            </h1>
            <p className="text-muted text-sm">
              Placed on {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleDownloadInvoice();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover-bg"
          >
            <Printer size={16} />
            Download Invoice
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleDownloadDeliverySlip();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-hover-bg"
          >
            <Printer size={16} />
            Download Delivery Slip
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(safeOrder.order_items || []).map((item: OrderItemLike) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border dark:border-border/50 last:border-0">
                    <div>
                      <p className="font-medium text-foreground dark:text-foreground dark:text-white">{item.products?.name}</p>
                      {item.product_variants && (
                        <p className="text-xs text-muted mt-1">
                          {item.product_variants.name}: {item.product_variants.value}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground dark:text-foreground dark:text-white">PKR {(Number(item.price_at_time || 0) * 277).toLocaleString()} x {item.quantity || 0}</p>
                      <p className="font-medium text-accent-gold">PKR {(Number(item.price_at_time || 0) * (item.quantity || 0) * 277).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-foreground dark:text-foreground dark:text-white">PKR {(Number(safeOrder.subtotal || 0) * 277).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="text-foreground dark:text-foreground dark:text-white">PKR {(Number(safeOrder.shipping_cost || 0) * 277).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
                <span className="text-foreground dark:text-foreground dark:text-white">PKR {(Number(safeOrder.tax || 0) * 277).toLocaleString()}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-PKR {(Number(order.discount) * 277).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-border dark:border-border/50 flex justify-between font-bold text-lg">
                <span className="text-foreground dark:text-foreground dark:text-white">Total</span>
                <span className="text-accent-gold">PKR {(Number(order.total) * 277).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    status === "Paid" || status === "Delivered" || status === "Received" ? "success" :
                    status === "Cancelled" || status === "Returned" ? "destructive" :
                    status === "Shipped" ? "luxury" : "outline"
                  }
                  className="px-3 py-1 text-sm"
                >
                  {status}
                </Badge>
              </div>

              <div className="pt-4 border-t border-border dark:border-border/50 space-y-3">
                <p className="text-sm text-muted font-medium">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((s) => (
                    <Button
                      key={s}
                      variant={s === status ? "luxury" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate(s)}
                      disabled={loading || s === status}
                      className="text-xs"
                    >
                      {loading && s !== status ? <RefreshCw className="animate-spin mr-1" size={12} /> : null}
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted mb-1">Name</p>
                <p className="text-foreground dark:text-white font-medium">{safeOrder.user?.full_name || "Guest"}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Email</p>
                <p className="text-foreground dark:text-foreground dark:text-white">{safeOrder.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Shipping Address</p>
                {order.addresses ? (
                  <div className="text-foreground dark:text-foreground dark:text-white space-y-0.5">
                    <p>{order.addresses.address_line_1}</p>
                    {order.addresses.address_line_2 && <p>{order.addresses.address_line_2}</p>}
                    <p>{order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}</p>
                    <p>{order.addresses.country}</p>
                  </div>
                ) : (
                  <p className="text-muted">No address provided</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
