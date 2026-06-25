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

export const GEMINI_MODEL = "gemini-2.0-flash";
export const EMBEDDING_MODEL = "text-embedding-004";
