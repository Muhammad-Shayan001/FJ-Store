import { NextResponse, NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import { generateGeminiContent } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, context: any) {
  try {
    const body = await req.json();
    const { userId, category, viewedProducts, purchaseHistory, limit = 5 } = body;

    const supabase = await createClient();
    const ai = getGeminiClient();

    // Fetch products from the same category
    let query = supabase
      .from("products")
      .select("id, name, slug, short_description, regular_price, sale_price, brand, category_id")
      .eq("is_published", true);

    if (category) {
      query = query.eq("category_id", category);
    }

    const { data: products } = await query.limit(20);

    if (!products || products.length === 0) {
      return NextResponse.json({
        recommendations: [],
        type: "category",
      });
    }

    // Build context for AI
    const productList = products
      .map((p) => `${p.name} ($${p.sale_price || p.regular_price}) - ${p.short_description}`)
      .join("\n");

    const prompt = `You are an expert recommendation engine for a luxury eCommerce store.
Given these products and user context, recommend the top ${limit} products.

Available Products:
${productList}

User Viewed: ${viewedProducts || "None"}
User Purchased: ${purchaseHistory || "None"}

Return a JSON object with EXACTLY this key (no markdown, no code fences, just raw JSON):
{
  "recommended_product_names": ["product1", "product2", "product3", "product4", "product5"],
  "reason": "Brief explanation of why these are recommended"
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    // Match product names to actual products
    const recommendedProducts = products.filter((p) =>
      data.recommended_product_names.some(
        (name: string) => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase())
      )
    );

    return NextResponse.json({
      recommendations: recommendedProducts.slice(0, limit),
      reason: data.reason,
      type: "ai_powered",
    });
  } catch (error: any) {
    console.error("[AI Recommendations] Error:", error);
    return NextResponse.json(
      { error: error.message || "Recommendation generation failed.", recommendations: [] },
      { status: 500 }
    );
  }
}
