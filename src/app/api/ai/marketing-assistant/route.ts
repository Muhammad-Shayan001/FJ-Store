import { NextRequest, NextResponse } from "next/server";
import { getGroqContent } from "@/lib/ai/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignType, products, tone = "professional" } = body;

    if (!campaignType || !products) {
      return NextResponse.json(
        { error: "campaignType and products are required." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const productList = Array.isArray(products) ? products.join(", ") : products;

    const prompt = `You are an expert marketing copywriter for a luxury eCommerce store called "FJ Store".
Generate compelling marketing content for a ${campaignType} campaign.

Products: ${productList}
Tone: ${tone}

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "subject_line": "Email subject line (max 60 chars)",
  "headline": "Campaign headline (compelling and benefit-focused)",
  "body": "Email/campaign body (2-3 paragraphs with HTML formatting <p>, <strong>, <em> as appropriate)",
  "cta_text": "Call-to-action button text",
  "banner_text": "Short banner text for promotional banners (max 50 chars)",
  "social_post": "Social media post (Twitter/Instagram friendly, max 280 chars)"
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
    console.error("[AI Marketing Assistant] Error:", error);
    return NextResponse.json(
      { error: error.message || "Marketing content generation failed." },
      { status: 500 }
    );
  }
}
