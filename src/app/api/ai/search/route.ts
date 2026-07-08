import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required." }, { status: 400 });
    }

    const supabase = await createClient();

    // Text-based search through products
    const { data: results, error } = await supabase
      .from("products")
      .select("id, name, slug, short_description, regular_price, sale_price, brand, category:categories(name)")
      .ilike("name", `%${query}%`)
      .eq("is_published", true)
      .limit(20);

    if (error) {
      console.error("[AI Search] Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      results: results || [],
      method: "text_search",
      query: query,
    });
  } catch (error: any) {
    console.error("[AI Search] Error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed." },
      { status: 500 }
    );
  }
}
