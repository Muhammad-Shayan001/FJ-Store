import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderTrackingClient from "./OrderTrackingClient";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
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
      addresses (*),
      order_items (
        *,
        products (name, slug, categories (slug), subcategories (slug)),
        product_variants (name, value)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Order Not Found</h1>
        <p className="text-muted">The order you are looking for does not exist or you do not have permission to view it.</p>
      </div>
    );
  }

  // Fetch profile for email/name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12">
      <div className="container mx-auto max-w-4xl px-4">
        <OrderTrackingClient 
          order={order} 
          customerName={profile?.full_name || "Customer"} 
          customerEmail={user.email || ""} 
        />
      </div>
    </div>
  );
}
