import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import AdminOrderDetailsClient from "./AdminOrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }: { params: { id?: string } }) {
  const id = params?.id;

  if (!id || id === "undefined") {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Unable to load order</h1>
        <p className="text-muted">No valid order ID was provided. Please go back to the orders list and try again.</p>
      </div>
    );
  }

  let supabase;
  let errorMessage: string | null = null;

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
    errorMessage = error?.message || "Order not found.";
    console.error("[ADMIN ORDER PAGE] Failed to load order:", errorMessage);

    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Unable to load order</h1>
        <p className="text-muted">The selected order could not be loaded. Please try again later or go back to the orders list.</p>
        <p className="text-sm text-red-500 mt-4">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminOrderDetailsClient order={order} />
    </div>
  );
}
