import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, GROQ_MODEL, getGroqContent } from "@/lib/ai/groq";

/**
 * API DIAGNOSTIC TEST ENDPOINT
 * Usage: GET /api/ai/test
 * 
 * Tests Groq API to verify configuration
 * Gemini is now optional fallback, not tested
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
    primaryRecommendation: string;
  } = {
    timestamp: new Date().toISOString(),
    groq: { name: "Groq API", configured: false, working: false },
    primaryRecommendation: "",
  };

  // ============================================
  // TEST: Groq API (Primary)
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
        const content = await getGroqContent("Say 'Hello from Groq' in one word.", {
          maxTokens: 10,
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
  // GENERATE RECOMMENDATION
  // ============================================
  if (results.groq.working) {
    results.primaryRecommendation =
      "✅ Groq API working! All AI features operational. Groq is primary engine.";
  } else if (!results.groq.working) {
    results.primaryRecommendation =
      "❌ Groq API not working. Add GROQ_API_KEY to .env.local";
  }

  console.log("[API TEST] Diagnostic complete");
  console.log("[API TEST] Recommendation:", results.primaryRecommendation);

  return NextResponse.json(results);
}
