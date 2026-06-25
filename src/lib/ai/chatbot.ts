/**
 * Main Chatbot Service with Fallback Logic
 * Uses both Groq and Gemini APIs
 * Primary: Groq API
 * Fallback: Gemini API
 */

import { getGroqResponse } from "./groq";
import { getGeminiClient, GEMINI_MODEL } from "./gemini";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Get AI response with automatic fallback
 * Tries Groq first, falls back to Gemini if Groq fails
 *
 * @param messages - Chat message history
 * @param systemContext - System instruction for the AI
 * @returns Object with reply and which API was used
 */
export async function getChatbotResponse(
  messages: ChatMessage[],
  systemContext: string
): Promise<{
  reply: string;
  source: "groq" | "gemini";
  error?: string;
}> {
  // ============================================
  // STEP 1: Try Groq API (Primary)
  // ============================================
  try {
    console.log("[CHATBOT] Attempting Groq API (primary)...");
    const reply = await getGroqResponse(messages, systemContext);
    console.log("[CHATBOT] ✓ Success with Groq API");
    return { reply, source: "groq" };
  } catch (groqError) {
    const groqErrorMsg = groqError instanceof Error ? groqError.message : String(groqError);
    console.warn("[CHATBOT] ✗ Groq failed:", groqErrorMsg);
    console.warn("[CHATBOT] Attempting fallback to Gemini API...");
  }

  // ============================================
  // STEP 2: Fallback to Gemini API (Secondary)
  // ============================================
  try {
    console.log("[CHATBOT] Initializing Gemini client...");
    const client = getGeminiClient();

    // Build conversation history for Gemini
    const conversationHistory = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    console.log("[CHATBOT] Calling Gemini API...");
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: conversationHistory,
      config: {
        systemInstruction: systemContext,
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I'm sorry, I couldn't generate a response. Please try again.";
    console.log("[CHATBOT] ✓ Success with Gemini API (fallback)");
    return { reply, source: "gemini" };
  } catch (geminiError) {
    const geminiErrorMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
    console.error("[CHATBOT] ✗ Both APIs failed!");
    console.error("[CHATBOT] Groq failed, then Gemini failed:", geminiErrorMsg);

    // ============================================
    // STEP 3: Both APIs failed - Return fallback message
    // ============================================
    return {
      reply: "Sorry, the chatbot is currently unavailable. Please try again later or contact support@fjstore.com for assistance.",
      source: "gemini",
      error: `Both APIs failed. Last error: ${geminiErrorMsg}`,
    };
  }
}
