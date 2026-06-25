import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryName, categoryDescription } = body;

    if (!categoryName) {
      return NextResponse.json({ error: "categoryName is required." }, { status: 400 });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert eCommerce content writer. Generate compelling category content for a luxury store.

Category Name: ${categoryName}
Current Description: ${categoryDescription || "N/A"}

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "description": "Rich, engaging category description (100-200 words, HTML formatted with <p>, <ul>, <li> tags if needed)",
  "meta_title": "SEO-optimized meta title (max 60 chars)",
  "meta_description": "SEO meta description (max 155 chars)",
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "featured_text": "A compelling tagline or featured text for the category (max 100 chars)"
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
    console.error("[AI Category Generator] Error:", error);
    return NextResponse.json(
      { error: error.message || "Category generation failed." },
      { status: 500 }
    );
  }
}
