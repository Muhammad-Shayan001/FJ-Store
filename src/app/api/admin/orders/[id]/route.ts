import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

function getOrderIdFromRequest(request: Request, params: { id?: string | string[] } | undefined) {
  if (params?.id) {
    if (typeof params.id === "string") {
      return params.id;
    }
    if (Array.isArray(params.id) && params.id.length > 0) {
      return params.id[0];
    }
  }

  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { id?: string | string[] } }) {
  try {
    const orderId = getOrderIdFromRequest(request, params);
    if (!orderId || orderId === "undefined") {
      return NextResponse.json({ success: false, error: "Order ID is required." }, { status: 400 });
    }

    const authSupabase = await createClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await authSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 });
    }

    const role = profile?.role?.toString().toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "";
    const userEmail = user.email?.toLowerCase() || "";
    const isAdmin = role === "admin" || role === "superadmin" || role === "owner" || (adminEmail !== "" && userEmail === adminEmail);

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 });
    }

    let serviceSupabase;
    let orderQueryClient = authSupabase;

    try {
      serviceSupabase = await createServiceRoleClient();
      orderQueryClient = serviceSupabase;
    } catch (serviceError) {
      console.warn("[ADMIN ORDER API] Service role client unavailable, using authenticated admin client.", serviceError);
    }

    const { data: order, error: orderError } = await orderQueryClient
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

    if (orderError) {
      return NextResponse.json(
        { success: false, error: orderError.message || "Unable to retrieve the order." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("[ADMIN ORDER API] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 }
    );
  }
}
