/**
 * Gemini API Client - Direct REST API calls
 * Uses the official Gemini REST API endpoint
 */

export const GEMINI_MODEL = "gemini-pro";
export const EMBEDDING_MODEL = "embedding-001";

/**
 * Generate content from a text prompt using Gemini via REST API
 * @param prompt - The text prompt to send to Gemini
 * @param config - Optional configuration (maxOutputTokens, temperature)
 * @returns The generated text
 */
export async function generateGeminiContent(
  prompt: string,
  config?: { maxOutputTokens?: number; temperature?: number }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: config?.maxOutputTokens || 1000,
        temperature: config?.temperature || 0.7,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No text in Gemini response");
  }

  return text;
}

/**
 * Generate content from a conversation using Gemini via REST API
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const conversationHistory = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const requestBody: any = {
    contents: conversationHistory,
    generationConfig: {
      maxOutputTokens: config?.maxOutputTokens || 500,
      temperature: config?.temperature || 0.7,
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No text in Gemini response");
  }

  return text;
}
