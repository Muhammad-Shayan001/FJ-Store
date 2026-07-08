import { NextResponse } from "next/server";
import { createServiceRoleClient, getServiceRoleConfigErrorMessage } from "@/lib/supabase/server";

async function getAdminClient() {
  try {
    return await createServiceRoleClient();
  } catch {
    throw new Error(getServiceRoleConfigErrorMessage());
  }
}

export async function GET() {
  try {
    const supabase = await getAdminClient();

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, sku, stock_quantity, regular_price, categories(name)")
      .order("name");

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    const { data: logs, error: logsError } = await supabase
      .from("inventory_logs")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(30);

    if (logsError) {
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    return NextResponse.json({ products, logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin inventory data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, stock_quantity, reason } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    if (typeof stock_quantity !== "number") {
      return NextResponse.json({ error: "Stock quantity must be a number." }, { status: 400 });
    }

    const supabase = await getAdminClient();

    const { error: prodErr } = await supabase
      .from("products")
      .update({
        stock_quantity,
        stock_status: stock_quantity > 0 ? "in_stock" : "out_of_stock",
      })
      .eq("id", id);

    if (prodErr) {
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    const { error: logErr } = await supabase.from("inventory_logs").insert({
      product_id: id,
      quantity_changed: Number(body.quantity_changed) || 0,
      reason: reason || "Manual inventory adjustment",
    });

    if (logErr) {
      return NextResponse.json({ error: logErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update inventory.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
