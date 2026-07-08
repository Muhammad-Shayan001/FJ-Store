import { GoogleGenAI } from "@google/genai";

// Singleton Gemini client
let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

export const GEMINI_MODEL = "gemini-1.5-flash";
export const EMBEDDING_MODEL = "text-embedding-004";

/**
 * Generate content from a text prompt using Gemini
 * @param prompt - The text prompt to send to Gemini
 * @param config - Optional configuration (maxOutputTokens, temperature)
 * @returns The generated text
 */
export async function generateGeminiContent(
  prompt: string,
  config?: { maxOutputTokens?: number; temperature?: number }
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: GEMINI_MODEL });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: config?.maxOutputTokens || 1000,
      temperature: config?.temperature || 0.7,
    },
  });

  return response.response.text();
}

/**
 * Generate content from a conversation using Gemini
 * @param messages - Array of messages in the conversation
 * @param systemInstruction - System instruction for the model
 * @param config - Optional configuration (maxOutputTokens, temperature)
 * @returns The generated text
 */
export async function generateGeminiChat(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemInstruction?: string,
  config?: { maxOutputTokens?: number; temperature?: number }
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: GEMINI_MODEL });

  const conversationHistory = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const response = await model.generateContent({
    contents: conversationHistory,
    systemInstruction: systemInstruction,
    generationConfig: {
      maxOutputTokens: config?.maxOutputTokens || 500,
      temperature: config?.temperature || 0.7,
    },
  });

  return response.response.text();
}
