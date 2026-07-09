"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@/components/ui";
import { Loader2, DollarSign, ShoppingCart, Users, Activity, Landmark, Percent } from "lucide-react";
import { format } from "date-fns";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const supabase = createBrowserClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [orderRes, userCountRes, productCountRes] = await Promise.all([
        supabase.from("orders").select("*, user:profiles(full_name)").order("total", { ascending: false }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
      ]);

      if (orderRes.data) setOrders(orderRes.data);
      if (userCountRes.count) setCustomersCount(userCountRes.count);
      if (productCountRes.count) setProductsCount(productCountRes.count);

      setLoading(false);
    };
    fetchData();
  }, []);

  // Compute metrics
  const completedOrders = orders.filter((o) => o.status === "Delivered" || o.status === "Received");
  const totalSales = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

  // Monthly Revenue Data
  const monthlyRevenue = new Array(12).fill(0);
  orders.forEach((o) => {
    if (o.status !== "Cancelled" && o.status !== "Returned") {
      const month = new Date(o.created_at).getMonth();
      monthlyRevenue[month] += Number(o.total);
    }
  });

  const maxRevenue = Math.max(...monthlyRevenue, 1);

  // Status Counts
  const statusCounts: Record<string, number> = {
    Pending: 0,
    Accepted: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Received: 0,
    Cancelled: 0,
    Returned: 0,
  };

  orders.forEach((o) => {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-accent-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface/80 to-surface/40 border border-accent-gold/10 px-6 md:px-10 py-8 rounded-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground dark:text-white mb-2">Analytics & Reports</h1>
        <p className="text-muted">Analyze sales performance, store activity metrics, and customer spending habits.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-accent-gold/20 hover:border-accent-gold/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Gross Sales</span>
              <div className="p-2 bg-accent-gold/15 rounded-lg text-accent-gold">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground dark:text-white mb-1">PKR {totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted">From completed orders</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Average Order Value</span>
              <div className="p-2 bg-blue-500/15 rounded-lg text-blue-400">
                <Landmark size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground dark:text-white mb-1">PKR {avgOrderValue.toFixed(0).toLocaleString()}</div>
            <p className="text-xs text-muted">AOV across all orders</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Sales Count</span>
              <div className="p-2 bg-purple-500/15 rounded-lg text-purple-400">
                <ShoppingCart size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground dark:text-white mb-1">{totalOrdersCount}</div>
            <p className="text-xs text-muted">Total placed orders</p>
          </CardContent>
        </Card>

        <Card className="border border-green-500/20 hover:border-green-500/40 transition-colors">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">User Count</span>
              <div className="p-2 bg-green-500/15 rounded-lg text-green-400">
                <Users size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground dark:text-white mb-1">{customersCount}</div>
            <p className="text-xs text-muted">Registered accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pt-6">
                <div className="flex items-end justify-between h-64 gap-1.5 px-2 pb-4 border-b border-border">
                  {monthlyRevenue.map((h, i) => {
                    const pct = (h / maxRevenue) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full h-full flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-accent-gold to-accent-gold/40 hover:from-accent-gold/90 hover:to-accent-gold/60 rounded-t-lg transition-all duration-200 cursor-pointer relative"
                            style={{ height: `${pct || 4}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-foreground dark:text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              PKR {h.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-4 px-2">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Chart */}
        <div>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <Activity className="text-accent-gold" size={20} />
              <CardTitle>Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => {
                const total = totalOrdersCount || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground dark:text-white">{status}</span>
                      <span className="text-muted">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-gold rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Performing Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Highest Value Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 10).map((order) => (
                <TableRow key={order.id} className="hover:bg-black/5 dark:bg-white/5">
                  <TableCell className="font-mono text-sm text-foreground dark:text-white">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground dark:text-white">
                      {order.user?.full_name || "Guest Customer"}
                    </div>
                    <div className="text-xs text-muted">{order.user?.email}</div>
                  </TableCell>
                  <TableCell className="text-muted text-xs">
                    {format(new Date(order.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Delivered" || order.status === "Received"
                          ? "success"
                          : order.status === "Cancelled" || order.status === "Returned"
                          ? "destructive"
                          : order.status === "Shipped"
                          ? "luxury"
                          : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-accent-gold">
                    PKR {Number(order.total).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
