import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminOrderDetailsClient from "./AdminOrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch order with related data
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      user:profiles ( full_name, email ),
      addresses (*),
      order_items (
        *,
        products (name),
        product_variants (name, value)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Order Not Found</h1>
        <p className="text-muted">The order you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminOrderDetailsClient order={order} />
    </div>
  );
}
