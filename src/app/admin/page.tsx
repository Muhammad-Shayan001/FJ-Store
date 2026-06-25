import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Dashboard Stats
  const { data: orders } = await supabase.from("orders").select("total, status, created_at");
  const { count: customersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
  const { count: productsCount } = await supabase.from("products").select("*", { count: 'exact', head: true });
  const { count: activeOrdersCount } = await supabase.from("orders").select("*", { count: 'exact', head: true })
    .not('status', 'in', '("Cancelled","Returned","Delivered","Received")');

  let totalRevenue = 0;
  const monthlyRevenue = new Array(12).fill(0);

  if (orders) {
    orders.forEach((o) => {
      if (o.status !== 'Cancelled' && o.status !== 'Returned') {
        totalRevenue += Number(o.total);
        const month = new Date(o.created_at).getMonth();
        monthlyRevenue[month] += Number(o.total);
      }
    });
  }

  // Normalize monthly revenue for the chart height (percentage)
  const maxRevenue = Math.max(...monthlyRevenue, 1);
  const normalizedHeights = monthlyRevenue.map(r => (r / maxRevenue) * 100);

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-surface/80 to-surface/40 border border-accent-gold/10 px-6 md:px-10 py-8 rounded-2xl">
          <h1 className="text-4xl font-heading font-bold text-foreground dark:text-foreground dark:text-white mb-2">Dashboard</h1>
          <p className="text-muted">Welcome back! Here's your store overview.</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="group bg-gradient-to-br from-surface/80 to-surface/40 border border-accent-gold/20 hover:border-accent-gold/50 p-6 rounded-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted uppercase tracking-wide">Total Revenue</h3>
              <div className="p-3 bg-accent-gold/10 rounded-lg group-hover:bg-accent-gold/20 transition-colors">
                <DollarSign size={20} className="text-accent-gold" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground dark:text-foreground dark:text-white mb-2">
              PKR {(totalRevenue / 277).toFixed(0)}
            </div>
            <p className="text-xs text-muted">
              <span className="text-success">+12%</span> from last month
            </p>
          </div>

          {/* Active Orders */}
          <div className="group bg-gradient-to-br from-surface/80 to-surface/40 border border-blue-500/20 hover:border-blue-500/50 p-6 rounded-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted uppercase tracking-wide">Active Orders</h3>
              <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <ShoppingBag size={20} className="text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground dark:text-foreground dark:text-white mb-2">{activeOrdersCount || 0}</div>
            <p className="text-xs text-muted">Pending fulfillment</p>
          </div>

          {/* Total Customers */}
          <div className="group bg-gradient-to-br from-surface/80 to-surface/40 border border-purple-500/20 hover:border-purple-500/50 p-6 rounded-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted uppercase tracking-wide">Total Customers</h3>
              <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <Users size={20} className="text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground dark:text-foreground dark:text-white mb-2">{customersCount || 0}</div>
            <p className="text-xs text-muted">Registered users</p>
          </div>

          {/* Total Products */}
          <div className="group bg-gradient-to-br from-surface/80 to-surface/40 border border-green-500/20 hover:border-green-500/50 p-6 rounded-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted uppercase tracking-wide">Total Products</h3>
              <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <TrendingUp size={20} className="text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground dark:text-foreground dark:text-white mb-2">{productsCount || 0}</div>
            <p className="text-xs text-muted">In catalog</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-gradient-to-br from-surface/80 to-surface/40 border border-border dark:border-border rounded-2xl p-8">
          <div className="mb-8">
            <h3 className="text-xl font-heading font-bold text-foreground dark:text-foreground dark:text-white mb-2">Revenue Overview</h3>
            <p className="text-sm text-muted">Monthly revenue for the current year</p>
          </div>

          <div className="relative">
            <div className="flex items-end justify-between h-64 gap-1.5 px-2 pb-4 border-b border-border dark:border-border">
              {normalizedHeights.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-accent-gold to-accent-gold/50 hover:from-accent-gold/80 hover:to-accent-gold/40 rounded-t-lg transition-all duration-200 cursor-pointer relative"
                      style={{ height: `${h || 5}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-foreground dark:text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        PKR {(monthlyRevenue[i] / 277).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-xs text-muted mt-6 px-2">
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/admin/products" className="group bg-gradient-to-br from-surface/80 to-surface/40 border border-border dark:border-border hover:border-accent-gold/50 p-6 rounded-2xl transition-all duration-300">
            <h4 className="text-lg font-heading font-bold text-foreground dark:text-foreground dark:text-white mb-2 group-hover:text-accent-gold transition-colors">Manage Products</h4>
            <p className="text-sm text-muted">Add, edit, or remove products from your catalog</p>
          </a>

          <a href="/admin/orders" className="group bg-gradient-to-br from-surface/80 to-surface/40 border border-border dark:border-border hover:border-blue-500/50 p-6 rounded-2xl transition-all duration-300">
            <h4 className="text-lg font-heading font-bold text-foreground dark:text-foreground dark:text-white mb-2 group-hover:text-blue-400 transition-colors">View Orders</h4>
            <p className="text-sm text-muted">Track and manage customer orders</p>
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
