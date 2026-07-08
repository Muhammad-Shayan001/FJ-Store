import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient, getServiceRoleConfigErrorMessage } from "@/lib/supabase/server";

async function getPublicClient() {
  return await createClient();
}

async function getAdminClient() {
  try {
    return await createServiceRoleClient();
  } catch {
    throw new Error(getServiceRoleConfigErrorMessage());
  }
}

// GET /api/subcategories
export async function GET(request: Request) {
  const supabase = await getPublicClient();
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category_id");
  let query = supabase.from("subcategories").select("*, categories(name)").order("name");
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subcategories: data });
}

// POST /api/subcategories — create
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, category_id } = body;
    if (!name || !slug || !category_id) {
      return NextResponse.json({ error: "Name, slug, and category_id are required." }, { status: 400 });
    }
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .insert({ name, slug, category_id, is_active: true })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ subcategory: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/subcategories — update
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, category_id, is_active } = body;
    if (!id) return NextResponse.json({ error: "ID is required." }, { status: 400 });
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .update({ name, slug, category_id, is_active: is_active ?? true })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ subcategory: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/subcategories
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required." }, { status: 400 });
    const supabase = await getAdminClient();
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
