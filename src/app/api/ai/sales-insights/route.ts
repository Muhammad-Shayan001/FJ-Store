import { NextRequest, NextResponse } from "next/server";
import { getGroqContent } from "@/lib/ai/groq";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const ai = getGeminiClient();

    // Fetch recent order data
    const { data: orders } = await supabase
      .from("orders")
      .select("total, status, created_at, order_items(quantity, price, products(name))")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        trending: [],
        slowMoving: [],
        restockRecommendations: [],
        opportunities: [],
        summary: "Not enough order data to generate insights.",
      });
    }

    // Build a concise text summary of order data for AI
    const orderSummary = orders.map((o: any, i: number) => {
      const items = (o.order_items || [])
        .map((item: any) => `${item.products?.name} (qty: ${item.quantity}, $${item.price})`)
        .join(", ");
      return `Order ${i + 1} [${o.status}] $${o.total}: ${items}`;
    }).join("\n");

    const prompt = `Analyze these recent eCommerce orders and provide sales intelligence.

Orders:
${orderSummary}

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "trending": ["top selling product 1", "top selling product 2", "top selling product 3"],
  "slowMoving": ["slow product 1", "slow product 2"],
  "restockRecommendations": ["product that needs restock 1", "product that needs restock 2"],
  "opportunities": ["sales opportunity insight 1", "sales opportunity insight 2"],
  "summary": "A brief 2-3 sentence executive summary of sales performance"
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[AI Sales Insights] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate insights." },
      { status: 500 }
    );
  }
}
