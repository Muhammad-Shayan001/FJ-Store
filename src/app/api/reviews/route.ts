import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, orderId, rating, comment } = body;

    if (!productId || !orderId || rating == null || !comment) {
      return NextResponse.json(
        { success: false, error: "productId, orderId, rating, and comment are required." },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a number between 1 and 5." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, order_items(product_id)")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    if (order.status !== "Received") {
      return NextResponse.json(
        { success: false, error: "Reviews can only be submitted after the order is marked Received." },
        { status: 403 }
      );
    }

    const orderContainsProduct = order.order_items?.some((item: any) => item.product_id === productId);
    if (!orderContainsProduct) {
      return NextResponse.json(
        { success: false, error: "This product is not part of the received order." },
        { status: 400 }
      );
    }

    const { data: existingReview, error: existingError } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .eq("order_id", orderId)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ success: false, error: existingError.message }, { status: 500 });
    }

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already submitted a review for this order." },
        { status: 409 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        user_id: user.id,
        order_id: orderId,
        rating,
        comment,
        is_approved: false,
      })
      .select()
      .single();

    if (insertError || !data) {
      return NextResponse.json({ success: false, error: insertError?.message || "Failed to save review." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[REVIEWS API] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 }
    );
  }
}
