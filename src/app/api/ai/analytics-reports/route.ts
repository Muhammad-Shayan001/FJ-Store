import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportType, dateRange = "30" } = body;

    if (!reportType) {
      return NextResponse.json({ error: "reportType is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const ai = getGeminiClient();

    let analyticsData = "";

    if (reportType === "revenue_summary") {
      const { data: orders } = await supabase
        .from("orders")
        .select("total, status, created_at")
        .gte("created_at", new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString());

      const total = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const completed = orders?.filter((o) => o.status === "completed").length || 0;
      const pending = orders?.filter((o) => o.status === "pending").length || 0;

      analyticsData = `Revenue: $${total.toFixed(2)}\nCompleted Orders: ${completed}\nPending Orders: ${pending}\nAverage Order Value: $${(total / (orders?.length || 1)).toFixed(2)}`;
    } else if (reportType === "product_performance") {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("products(name), quantity, price");

      const productStats = (orderItems || []).reduce(
        (acc, item) => {
          const prod: any = Array.isArray(item.products) ? item.products[0] : item.products;
          const name = prod?.name || "Unknown";
          if (!acc[name]) acc[name] = { quantity: 0, revenue: 0 };
          acc[name].quantity += item.quantity || 0;
          acc[name].revenue += (item.price || 0) * (item.quantity || 0);
          return acc;
        },
        {} as Record<string, { quantity: number; revenue: number }>
      );

      analyticsData = Object.entries(productStats)
        .map(
          ([name, stats]) =>
            `${name}: ${stats.quantity} units, $${stats.revenue.toFixed(2)} revenue`
        )
        .join("\n");
    } else if (reportType === "user_growth") {
      const { data: users } = await supabase.from("users").select("created_at");

      const usersInPeriod = users?.filter(
        (u) =>
          new Date(u.created_at) >=
          new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
      ).length || 0;

      analyticsData = `New Users (${dateRange} days): ${usersInPeriod}\nTotal Users: ${users?.length || 0}`;
    } else if (reportType === "inventory") {
      const { data: products } = await supabase
        .from("products")
        .select("name, stock_quantity, stock_status");

      const lowStock = products?.filter((p) => (p.stock_quantity || 0) < 10).length || 0;
      const outOfStock = products?.filter((p) => p.stock_status === "out_of_stock").length || 0;

      analyticsData = `Total Products: ${products?.length || 0}\nLow Stock Items: ${lowStock}\nOut of Stock: ${outOfStock}`;
    }

    const prompt = `Generate a professional analytics report based on this data:

${analyticsData}

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "title": "Report Title",
  "summary": "Executive summary (2-3 sentences)",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "detailed_report": "Detailed analysis (HTML formatted with <p>, <h3>, <ul> tags)"
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
    console.error("[AI Analytics Reports] Error:", error);
    return NextResponse.json(
      { error: error.message || "Report generation failed." },
      { status: 500 }
    );
  }
}
