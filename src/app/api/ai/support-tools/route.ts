import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolType, context } = body;

    if (!toolType) {
      return NextResponse.json({ error: "toolType is required." }, { status: 400 });
    }

    const ai = getGeminiClient();

    let prompt = "";

    if (toolType === "suggested_reply") {
      const { customerMessage, orderInfo } = context;
      prompt = `You are a professional customer support representative for FJ Store.
Generate a helpful and friendly support reply.

Customer Message: "${customerMessage}"
Order Info: ${orderInfo || "N/A"}

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "reply": "Professional, empathetic support reply (keep under 200 words)",
  "tone": "The tone used (friendly/professional/apologetic)",
  "next_steps": "Suggested next steps for the support agent"
}`;
    } else if (toolType === "faq_generation") {
      const { topic } = context;
      prompt = `Generate 5 common FAQ questions and answers for an eCommerce store.

Topic: ${topic}

Return a JSON object with EXACTLY this key (no markdown, no code fences, just raw JSON):
{
  "faqs": [
    { "question": "Q1?", "answer": "A1" },
    { "question": "Q2?", "answer": "A2" },
    { "question": "Q3?", "answer": "A3" },
    { "question": "Q4?", "answer": "A4" },
    { "question": "Q5?", "answer": "A5" }
  ]
}`;
    } else if (toolType === "ticket_summary") {
      const { ticketContent } = context;
      prompt = `Summarize this customer support ticket concisely.

Ticket: "${ticketContent}"

Return a JSON object with EXACTLY these keys (no markdown, no code fences, just raw JSON):
{
  "summary": "Brief summary (1-2 sentences)",
  "priority": "low|medium|high|urgent",
  "category": "The issue category (billing/shipping/product_quality/technical/other)",
  "suggested_resolution": "Recommended resolution approach"
}`;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text || "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[AI Support Tools] Error:", error);
    return NextResponse.json(
      { error: error.message || "Support tool generation failed." },
      { status: 500 }
    );
  }
}
