import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, EMBEDDING_MODEL } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const ai = getGeminiClient();

    // 1. Generate embedding for the search query
    const embeddingResponse = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: query,
    });

    const embedding = embeddingResponse.embeddings?.[0]?.values;

    if (!embedding) {
      // Fallback: text-based search if embedding fails
      console.warn("[AI Search] Embedding generation failed, falling back to text search");
      const { data: fallbackResults } = await supabase
        .from("products")
        .select("id, name, slug, short_description, regular_price, sale_price, brand")
        .ilike("name", `%${query}%`)
        .eq("is_published", true)
        .limit(10);

      return NextResponse.json({
        results: fallbackResults || [],
        method: "text_fallback",
      });
    }

    // 2. Call the match_products RPC for vector similarity search
    const { data: semanticResults, error } = await supabase.rpc("match_products", {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 10,
    });

    if (error) {
      console.error("[AI Search] RPC error:", error);
      // Fallback to text search
      const { data: fallbackResults } = await supabase
        .from("products")
        .select("id, name, slug, short_description, regular_price, sale_price, brand")
        .ilike("name", `%${query}%`)
        .eq("is_published", true)
        .limit(10);

      return NextResponse.json({
        results: fallbackResults || [],
        method: "text_fallback",
      });
    }

    return NextResponse.json({
      results: semanticResults || [],
      method: "semantic",
    });
  } catch (error: any) {
    console.error("[AI Search] Error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed." },
      { status: 500 }
    );
  }
}
