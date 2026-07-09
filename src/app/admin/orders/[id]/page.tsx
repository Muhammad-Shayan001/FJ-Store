import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import AdminOrderDetailsClient from "./AdminOrderDetailsClient";

async function loadOrderFromApi(orderId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/admin/orders/${orderId}`, {
      method: "GET",
      headers: headers(),
      cache: "no-store",
    });

    const result = await response.json();
    return { response, result };
  } catch (error) {
    console.error("[ADMIN ORDER PAGE] API fetch failed:", error);
    return { response: null, result: null };
  }
}

async function loadOrderDirectly(orderId: string) {
  try {
    let supabase;
    try {
      supabase = await createServiceRoleClient();
    } catch (serviceError) {
      console.warn("[ADMIN ORDER PAGE] Service role client unavailable, falling back to authenticated admin client.", serviceError);
      supabase = await createClient();
    }

    if (!orderId || orderId === "undefined") {
      return { order: null, error: "Invalid order ID." };
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
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return { error: error?.message || "Order not found.", order: null };
    }

    return { order, error: null };
  } catch (error) {
    console.error("[ADMIN ORDER PAGE] Direct order load failed:", error);
    return { error: error instanceof Error ? error.message : "Internal server error.", order: null };
  }
}

export default async function AdminOrderDetailsPage({ params }: { params: { id?: string } }) {
  const id = params?.id;
  let order: any = null;
  let errorMessage: string | null = null;
  let redirectToLogin = false;

  if (!id || id === "undefined") {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Unable to load order</h1>
        <p className="text-muted">No valid order ID was provided. Please go back to the orders list and try again.</p>
      </div>
    );
  }

  const { response, result } = await loadOrderFromApi(id);

  if (response?.status === 401) {
    redirectToLogin = true;
  }

  if (response?.ok && result?.success && result.data) {
    order = result.data;
  } else {
    const directResult = await loadOrderDirectly(id);
    order = directResult.order;
    errorMessage = directResult.error;
  }

  if (!order) {
    if (redirectToLogin) {
      redirect("/login");
    }

    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Unable to load order</h1>
        <p className="text-muted">We could not load the selected order. Please refresh or try again later.</p>
        {errorMessage && <p className="text-sm text-red-500 mt-4">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminOrderDetailsClient order={order} />
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminOrderDetailsClient order={order} />
    </div>
  );
}
