import { NextResponse } from "next/server";

/**
 * HEALTH CHECK ENDPOINT
 * Usage: GET /api/health
 * Returns: { status: "ok", timestamp: ISO timestamp }
 * 
 * Use this to verify the server is running and responding
 */

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Server is running and responding to requests",
  });
}
