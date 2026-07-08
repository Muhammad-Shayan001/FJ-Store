import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, brand, features, ingredients, material } = body;

    if (!name) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }

    const prompt = `You are an expert eCommerce copywriter for a luxury store called "FJ Store".
Generate compelling product content based on the following inputs:

Product Name: ${name}
Category: ${category || "General"}
Brand: ${brand || "FJ Store"}
Features: ${features || "N/A"}
Ingredients: ${ingredients || "N/A"}
Material: ${material || "N/A"}

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "title": "An optimized product title (max 70 chars)",
  "short_description": "A compelling 1-2 sentence description (max 160 chars)",
  "full_description": "A rich HTML description with <p>, <ul>, <li> tags. 2-3 paragraphs highlighting benefits, features, and luxury appeal.",
  "seo_title": "SEO-optimized meta title (max 60 chars)",
  "seo_description": "SEO meta description with keywords (max 155 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

    const text = await generateGeminiContent(prompt, { maxOutputTokens: 1000 });
    
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[AI Generate Product] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content." },
      { status: 500 }
    );
  }
}
