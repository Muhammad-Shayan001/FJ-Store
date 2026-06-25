import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CouponsClient from "./CouponsClient";

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch initial coupons
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white mb-1">Coupon Management</h1>
          <p className="text-muted text-sm">Create and manage discount codes.</p>
        </div>
      </div>
      <CouponsClient initialCoupons={coupons || []} />
    </div>
  );
}
