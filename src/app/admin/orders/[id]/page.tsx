import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import AdminOrderDetailsClient from "./AdminOrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }: { params: { id?: string } }) {
  const id = params?.id;

  if (!id || id === "undefined") {
    redirect("/admin/orders");
  }

  let supabase;
  try {
    supabase = await createServiceRoleClient();
  } catch (serviceError) {
    console.warn("[ADMIN ORDER PAGE] Service role client unavailable, falling back to authenticated admin client.", serviceError);
    supabase = await createClient();
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      user:profiles ( full_name ),
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
    console.error("[ADMIN ORDER PAGE] Failed to load order:", error);
    redirect("/admin/orders");
  }

  return (
    <div className="space-y-6">
      <AdminOrderDetailsClient order={order} />
    </div>
  );
}
