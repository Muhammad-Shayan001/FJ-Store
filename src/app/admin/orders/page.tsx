"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Package, Search, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Table, Badge, Button, Input } from "@/components/ui";
import Link from "next/link";
import { format } from "date-fns";

function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createBrowserClient();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          total,
          status,
          user:profiles ( full_name, email )
        `)
        .order("created_at", { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [supabase]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.full_name?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "Pending") {
      return matchesSearch && o.status === "Pending";
    }
    if (statusFilter === "Delivered") {
      return matchesSearch && (o.status === "Delivered" || o.status === "Received");
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-foreground dark:text-white mb-1">
            {statusFilter ? `${statusFilter} Orders` : "All Orders"}
          </h1>
          <p className="text-muted text-sm">View and manage customer orders.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 justify-between">
          <CardTitle>{statusFilter ? `${statusFilter} Orders` : "All Orders"}</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <Input
                placeholder="Search orders..."
                className="pl-9 bg-surface/50 border-border dark:border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <Package size={32} className="mx-auto mb-3 opacity-50" />
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr className="border-b border-border dark:border-border text-left text-xs uppercase text-muted">
                    <th className="p-3 font-medium">Order ID</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Total</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border dark:border-border/50 hover:bg-surface dark:hover:bg-black/5 dark:bg-white/5 transition-colors">
                      <td className="p-3 text-sm font-mono text-foreground dark:text-foreground dark:text-white">
                        {order.id.split("-")[0].toUpperCase()}
                      </td>
                      <td className="p-3 text-sm text-foreground dark:text-foreground dark:text-white">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="p-3 text-sm text-foreground dark:text-foreground dark:text-white">
                        {order.user?.full_name || "Guest"}<br/>
                        <span className="text-xs text-muted">{order.user?.email}</span>
                      </td>
                      <td className="p-3 text-sm text-accent-gold font-medium">
                        PKR {Number(order.total).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            order.status === "Delivered" || order.status === "Received" ? "success" :
                            order.status === "Cancelled" || order.status === "Returned" ? "destructive" :
                            order.status === "Shipped" ? "luxury" : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye size={16} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}