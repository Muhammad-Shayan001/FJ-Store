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

// GET /api/categories
export async function GET() {
  const supabase = await getPublicClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data });
}

// POST /api/categories — create
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image_url } = body;
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
    }
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, slug, description: description || null, image_url: image_url || null, is_active: true })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ category: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT /api/categories — update
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, description, image_url, is_active } = body;
    if (!id) return NextResponse.json({ error: "ID is required." }, { status: 400 });
    const supabase = await getAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .update({ name, slug, description: description || null, image_url: image_url || null, is_active: is_active ?? true })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ category: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/categories
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required." }, { status: 400 });
    const supabase = await getAdminClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
