import { NextRequest, NextResponse } from "next/server";
import { getGroqContent } from "@/lib/ai/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, productDescription, category, keywords } = body;

    if (!productName || !productDescription) {
      return NextResponse.json(
        { error: "productName and productDescription are required." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert SEO specialist. Generate SEO-optimized content for an eCommerce product.

Product Name: ${productName}
Product Description: ${productDescription}
Category: ${category || "General"}
Keywords: ${keywords || "N/A"}

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "meta_title": "SEO-optimized meta title (max 60 chars, include primary keyword)",
  "meta_description": "SEO meta description (max 155 chars, compelling and includes keywords)",
  "og_title": "Open Graph title for social sharing (max 70 chars)",
  "og_description": "Open Graph description (max 160 chars)",
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "search_snippet": "How this product would appear in search results (2-3 sentences)"
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
    console.error("[AI SEO Generator] Error:", error);
    return NextResponse.json(
      { error: error.message || "SEO generation failed." },
      { status: 500 }
    );
  }
}
