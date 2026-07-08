/**
 * Gemini API Client - Direct REST API calls
 * Uses the official Gemini REST API endpoint
 */

export const GEMINI_MODEL = "gemini-1.5-flash-latest";
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

  // Try multiple API versions and model names for compatibility
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
  ];

  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
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

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          return text;
        }
      } else {
        const errorData = await response.json();
        lastError = new Error(
          `Gemini API error: ${errorData.error?.message || response.statusText}`
        );
        console.warn(`[Gemini] Failed with endpoint ${url}: ${lastError.message}`);
        continue;
      }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.warn(`[Gemini] Endpoint failed: ${lastError.message}`);
      continue;
    }
  }

  // All endpoints failed
  throw (
    lastError ||
    new Error(
      "Gemini API failed: Could not reach any endpoint. Check your API key and internet connection."
    )
  );
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

  // Try multiple API versions and model names for compatibility
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
  ];

  const conversationHistory = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const buildRequestBody = () => ({
    contents: conversationHistory,
    generationConfig: {
      maxOutputTokens: config?.maxOutputTokens || 500,
      temperature: config?.temperature || 0.7,
    },
    ...(systemInstruction && {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
    }),
  });

  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequestBody()),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          return text;
        }
      } else {
        const errorData = await response.json();
        lastError = new Error(
          `Gemini API error: ${errorData.error?.message || response.statusText}`
        );
        console.warn(`[Gemini Chat] Failed with endpoint ${url}: ${lastError.message}`);
        continue;
      }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.warn(`[Gemini Chat] Endpoint failed: ${lastError.message}`);
      continue;
    }
  }

  // All endpoints failed
  throw (
    lastError ||
    new Error(
      "Gemini Chat API failed: Could not reach any endpoint. Check your API key and internet connection."
    )
  );
}
