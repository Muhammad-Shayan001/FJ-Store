/**
 * Groq API Client
 * Fast, reliable primary AI API
 * This module is only imported by server-side API routes
 */

import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in environment variables");
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
}

export const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Generate content from a text prompt using Groq
 * @param prompt - The text prompt
 * @param config - Optional configuration (maxTokens, temperature)
 * @returns Generated text
 */
export async function getGroqContent(
  prompt: string,
  config?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const client = getGroqClient();

  console.log("[GROQ Content] Generating content...");

  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: config?.maxTokens || 1000,
      temperature: config?.temperature || 0.7,
    });

    console.log("[GROQ Content] ✓ Content generated successfully");

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in Groq response");
    }

    return content;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[GROQ Content] ✗ API Error:", errorMsg);
    throw error;
  }
}

/**
 * Send a message to Groq API
 * @param messages - Chat message history
 * @param systemContext - System instruction for the AI
 * @returns AI response text
 */
export async function getGroqResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemContext: string
): Promise<string> {
  const client = getGroqClient();

  console.log("[GROQ] Initializing request...");

  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemContext },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    console.log("[GROQ] ✓ Response received successfully");

    const reply = response.choices[0]?.message?.content;
    if (!reply) {
      throw new Error("No content in Groq response");
    }

    return reply;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[GROQ] ✗ API Error:", errorMsg);

    // Categorize the error for logging
    if (errorMsg.includes("429")) {
      console.error("[GROQ] Rate limit exceeded - will fallback to Gemini");
    } else if (errorMsg.includes("timeout")) {
      console.error("[GROQ] Timeout - will fallback to Gemini");
    } else if (errorMsg.includes("connection")) {
      console.error("[GROQ] Connection error - will fallback to Gemini");
    }

    throw error;
  }
}
