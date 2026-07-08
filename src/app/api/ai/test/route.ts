import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL } from "@/lib/ai/groq";
import { generateGeminiContent } from "@/lib/ai/gemini";

/**
 * API DIAGNOSTIC TEST ENDPOINT
 * Usage: GET /api/ai/test
 * 
 * Tests both Groq and Gemini APIs to verify configuration
 * Shows which API is working and provides recommendations
 */

interface ApiTest {
  name: string;
  configured: boolean;
  working: boolean;
  error?: string;
  responseTime?: number;
}

export async function GET(req: NextRequest) {
  console.log("[API TEST] Starting diagnostic test...");

  const results: {
    timestamp: string;
    groq: ApiTest;
    gemini: ApiTest;
    primaryRecommendation: string;
  } = {
    timestamp: new Date().toISOString(),
    groq: { name: "Groq API", configured: false, working: false },
    gemini: { name: "Gemini API", configured: false, working: false },
    primaryRecommendation: "",
  };

  // ============================================
  // TEST 1: Groq API
  // ============================================
  try {
    if (!process.env.GROQ_API_KEY) {
      console.log("[API TEST] Groq API: Not configured (missing GROQ_API_KEY)");
      results.groq.configured = false;
    } else {
      results.groq.configured = true;
      console.log("[API TEST] Groq API: Configured ✓");

      try {
        const startTime = Date.now();
        const client = getGroqClient();

        const response = await client.chat.completions.create({
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant. Keep your response very short.",
            },
            {
              role: "user",
              content: "Say 'Hello from Groq' in one word responses.",
            },
          ],
          max_tokens: 10,
          temperature: 0.7,
        });

        const responseTime = Date.now() - startTime;
        results.groq.working = true;
        results.groq.responseTime = responseTime;
        console.log(`[API TEST] Groq API: Working ✓ (${responseTime}ms)`);
      } catch (error) {
        results.groq.working = false;
        results.groq.error = error instanceof Error ? error.message : String(error);
        console.error(`[API TEST] Groq API: Failed ✗ - ${results.groq.error}`);
      }
    }
  } catch (error) {
    results.groq.configured = false;
    results.groq.error = error instanceof Error ? error.message : String(error);
    console.error(`[API TEST] Groq API: Configuration error - ${results.groq.error}`);
  }

  // ============================================
  // TEST 2: Gemini API
  // ============================================
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("[API TEST] Gemini API: Not configured (missing GEMINI_API_KEY)");
      results.gemini.configured = false;
    } else {
      results.gemini.configured = true;
      console.log("[API TEST] Gemini API: Configured ✓");

      try {
        const startTime = Date.now();
        const client = getGeminiClient();

        const response = await client.models.generateContent({
          model: GEMINI_MODEL,
          contents: [
            {
              role: "user",
              parts: [{ text: "Say 'Hello from Gemini' in one word." }],
            },
          ],
          config: {
            systemInstruction: "You are a helpful assistant. Keep your response very short.",
            maxOutputTokens: 10,
            temperature: 0.7,
          },
        });

        const responseTime = Date.now() - startTime;
        results.gemini.working = true;
        results.gemini.responseTime = responseTime;
        console.log(`[API TEST] Gemini API: Working ✓ (${responseTime}ms)`);
      } catch (error) {
        results.gemini.working = false;
        results.gemini.error = error instanceof Error ? error.message : String(error);
        console.error(`[API TEST] Gemini API: Failed ✗ - ${results.gemini.error}`);
      }
    }
  } catch (error) {
    results.gemini.configured = false;
    results.gemini.error = error instanceof Error ? error.message : String(error);
    console.error(`[API TEST] Gemini API: Configuration error - ${results.gemini.error}`);
  }

  // ============================================
  // GENERATE RECOMMENDATION
  // ============================================
  if (results.groq.working && results.gemini.working) {
    results.primaryRecommendation =
      "✅ Both APIs working! Groq is primary (fast), Gemini is fallback. Chatbot fully operational.";
  } else if (results.groq.working && !results.gemini.working) {
    results.primaryRecommendation =
      "⚠️ Only Groq working. Gemini needs configuration. If Groq fails, chatbot will be down.";
  } else if (!results.groq.working && results.gemini.working) {
    results.primaryRecommendation =
      "⚠️ Only Gemini working. Groq needs configuration. Add GROQ_API_KEY to .env.local for better reliability.";
  } else {
    results.primaryRecommendation =
      "❌ Neither API working. Add GROQ_API_KEY and verify GEMINI_API_KEY in .env.local";
  }

  console.log("[API TEST] Diagnostic complete");
  console.log("[API TEST] Recommendation:", results.primaryRecommendation);

  return NextResponse.json(results);
}
