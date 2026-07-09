import { format } from "date-fns";
import { createClient, createServiceRoleClient, getServiceRoleConfigErrorMessage } from "@/lib/supabase/server";
import { Package, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Table, Badge, Button } from "@/components/ui";
import Link from "next/link";

interface AdminOrdersPageProps {
  searchParams?: { status?: string | string[]; search?: string | string[] };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const statusFilter = Array.isArray(searchParams?.status) ? searchParams?.status[0] : searchParams?.status;
  const searchText = Array.isArray(searchParams?.search) ? searchParams?.search[0] : searchParams?.search;
  const normalizedSearch = (searchText || "").trim().toLowerCase();

  let supabase;
  let orders: any[] | null = null;
  let error: any = null;

  try {
    supabase = await createServiceRoleClient();
  } catch (serviceRoleError) {
    console.warn("[ADMIN ORDERS] Service role client unavailable, falling back to authenticated admin client.", serviceRoleError);
    supabase = await createClient();
  }

  const query = supabase
    .from("orders")
    .select(`
      id,
      created_at,
      total,
      status,
      user:profiles ( full_name, email )
    `)
    .order("created_at", { ascending: false });

  const response = await query;
  orders = response.data;
  error = response.error;

  const orderList = error || !orders ? [] : orders;

  const filteredOrders = orderList.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(normalizedSearch) ||
      o.user?.full_name?.toLowerCase().includes(normalizedSearch) ||
      o.user?.email?.toLowerCase().includes(normalizedSearch);

    if (statusFilter === "Pending") {
      return matchesSearch && o.status === "Pending";
    }
    if (statusFilter === "Delivered") {
      return matchesSearch && (o.status === "Delivered" || o.status === "Received");
    }
    if (statusFilter === "Paid") {
      return matchesSearch && o.status === "Paid";
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
          <form className="flex gap-2" method="get">
            <input
              name="search"
              type="text"
              defaultValue={normalizedSearch}
              placeholder="Search orders..."
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none focus:border-accent-gold"
            />
            <button
              type="submit"
              className="rounded-xl bg-accent-gold px-4 py-2 text-sm font-semibold text-black hover:bg-accent-gold/90"
            >
              Search
            </button>
          </form>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
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
                        {order.user?.full_name || "Guest"}<br />
                        <span className="text-xs text-muted">{order.user?.email}</span>
                      </td>
                      <td className="p-3 text-sm text-accent-gold font-medium">
                        PKR {Number(order.total).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            order.status === "Paid" || order.status === "Delivered" || order.status === "Received" ? "success" :
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
