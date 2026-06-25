import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse } from "@/lib/ai/chatbot";

const SYSTEM_CONTEXT = `You are FJ Assistant, a helpful and friendly AI shopping assistant for FJ Store — a premium luxury eCommerce platform selling jewelry, bangles, cosmetics, food items, and fashion accessories.

Your capabilities:
- Help customers find products
- Answer questions about orders, shipping, and returns
- Provide product recommendations based on preferences
- Answer FAQs about the store

Store Policies:
- Free shipping on orders over $100
- 30-day return policy for unused items
- Email support at support@fjstore.com
- Typical delivery time: 3-7 business days

Guidelines:
- Be warm, professional, and concise
- If you don't know something specific (like exact stock), say you'll help them check and suggest they contact support
- Never make up product names or prices
- Keep responses under 150 words unless the user asks for detail`;

export async function POST(req: NextRequest) {
  try {
    console.log("[AI CHAT] Request received");
    
    const { messages } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("[AI CHAT] Invalid messages:", { provided: !!messages, isArray: Array.isArray(messages), length: messages?.length });
      return NextResponse.json({ error: "messages array is required." }, { status: 400 });
    }

    console.log(`[AI CHAT] Processing ${messages.length} messages`);

    // Get response with automatic fallback logic
    const result = await getChatbotResponse(messages, SYSTEM_CONTEXT);

    console.log(`[AI CHAT] ✓ Response generated using ${result.source} (${result.reply.length} chars)`);

    // Return response in standardized format
    return NextResponse.json({ reply: result.reply, source: result.source });
  } catch (error: any) {
    console.error("[AI CHAT] Unexpected error:", error);
    console.error("[AI CHAT] Error stack:", error instanceof Error ? error.stack : "");
    return NextResponse.json(
      { error: error.message || "Chat failed." },
      { status: 500 }
    );
  }
}
