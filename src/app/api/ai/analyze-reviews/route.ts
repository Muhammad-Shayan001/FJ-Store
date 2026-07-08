import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required." }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch reviews
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("rating, comment")
      .eq("product_id", productId);

    if (error) throw error;

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        summary: "No reviews available for this product yet.",
        positive: [],
        negative: [],
        commonPraise: [],
        commonComplaints: [],
        averageRating: 0,
        totalReviews: 0,
      });
    }

    const ai = getGeminiClient();

    const reviewTexts = reviews
      .map((r, i) => `Review ${i + 1} (${r.rating}/5): ${r.comment || "No comment"}`)
      .join("\n");

    const prompt = `Analyze the following product reviews and provide a structured summary.

Reviews:
${reviewTexts}

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "summary": "A brief 2-sentence overall sentiment summary",
  "positive": ["positive point 1", "positive point 2", "positive point 3"],
  "negative": ["negative point 1", "negative point 2"],
  "commonPraise": ["commonly praised aspect 1", "commonly praised aspect 2"],
  "commonComplaints": ["common complaint 1", "common complaint 2"],
  "sentimentScore": 0.0 to 1.0 representing overall positivity
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return NextResponse.json({
      ...data,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error: any) {
    console.error("[AI Analyze Reviews] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze reviews." },
      { status: 500 }
    );
  }
}
