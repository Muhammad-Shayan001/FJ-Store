import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { sendOrderStatusUpdateEmail } from "@/lib/services/emailHelper";

const ADMIN_ALLOWED_STATUSES = [
  "Pending",
  "Paid",
  "Accepted",
  "Processing",
  "Shipped",
  "Delivered",
  "Received",
  "Cancelled",
  "Returned",
];

const USER_ALLOWED_STATUS = ["Received"];
const USER_ALLOWED_PREVIOUS_STATUSES = ["Delivered", "Shipped"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: orderId and newStatus." },
        { status: 400 }
      );
    }

    if (!ADMIN_ALLOWED_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value." },
        { status: 400 }
      );
    }

    const authSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

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
    const isAdmin =
      role === "admin" ||
      role === "superadmin" ||
      role === "owner" ||
      (adminEmail !== "" && userEmail === adminEmail);

    let serviceSupabase;
    let orderQueryClient = authSupabase;

    try {
      serviceSupabase = await createServiceRoleClient();
      orderQueryClient = serviceSupabase;
    } catch (serviceError) {
      console.warn("[ORDER STATUS API] Service role client unavailable, using authenticated client.", serviceError);
    }

    const { data: order, error: orderError } = await orderQueryClient
      .from("orders")
      .select("user_id, status, user:profiles ( full_name )")
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

    let customerEmail = "";
    if (serviceSupabase && order.user_id) {
      const { data: userDetails, error: userDetailsError } = await serviceSupabase
        .from("auth.users")
        .select("email")
        .eq("id", order.user_id)
        .single();

      if (!userDetailsError && userDetails?.email) {
        customerEmail = userDetails.email;
      }
    }

    if (!isAdmin && order.user_id !== user.id) {
      return NextResponse.json({ success: false, error: "Not authorized to update this order." }, { status: 403 });
    }

    if (!isAdmin) {
      if (!USER_ALLOWED_STATUS.includes(newStatus)) {
        return NextResponse.json({ success: false, error: "Customers can only mark orders as Received." }, { status: 403 });
      }

      if (!USER_ALLOWED_PREVIOUS_STATUSES.includes(order.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Order must be in Delivered or Shipped status before it can be marked Received. Current status: ${order.status}`,
          },
          { status: 400 }
        );
      }
    }

    if (order.status === newStatus) {
      return NextResponse.json({ success: true, message: "Order status is already set." });
    }

    const updateClient = serviceSupabase || authSupabase;
    const { error: updateError } = await updateClient
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (updateError) {
      console.error("[ORDER STATUS API] Failed to update order status:", updateError);
      return NextResponse.json({ success: false, error: "Failed to update order status." }, { status: 500 });
    }

    if (order.user_id) {
      await serviceSupabase.from("notifications").insert({
        user_id: order.user_id,
        title: `Order Status Updated: ${newStatus}`,
        message: `Your order #${orderId.substring(0, 8).toUpperCase()} is now ${newStatus}.`,
        is_read: false,
      });
    }

    const emailAddress = order.user?.email || user.email || "";
    const customerName = order.user?.full_name || (user.user_metadata as any)?.full_name || "Valued Customer";

    if (emailAddress) {
      await sendOrderStatusUpdateEmail(
        emailAddress,
        customerName,
        orderId,
        newStatus,
        `Your order has been updated to ${newStatus}. Thank you for shopping with FJ Store Pakistan!`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ORDER STATUS API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
