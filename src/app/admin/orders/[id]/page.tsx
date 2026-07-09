import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import AdminOrderDetailsClient from "./AdminOrderDetailsClient";

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let supabase;
  let isServiceRoleClient = false;

  try {
    supabase = await createServiceRoleClient();
    isServiceRoleClient = true;
  } catch {
    supabase = await createClient();
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-4">Order Not Found</h1>
        <p className="text-muted">The order you are looking for does not exist or you do not have permission to view it.</p>
        {error?.message && <p className="text-sm text-red-500 mt-4">{error.message}</p>}
      </div>
    );
  }

  if (isServiceRoleClient && order.user_id) {
    try {
      const { data: authUser } = await supabase
        .from("auth.users")
        .select("id, email")
        .eq("id", order.user_id)
        .single();

      if (authUser && authUser.email) {
        order.user = {
          ...(order.user || {}),
          email: authUser.email,
        };
      }
    } catch {
      // swallow auth user lookup errors
    }
  }

  return (
    <div className="space-y-6">
      <AdminOrderDetailsClient order={order} />
    </div>
  );
}
