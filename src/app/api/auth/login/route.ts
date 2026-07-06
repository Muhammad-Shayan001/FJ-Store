import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const isNetworkIssue =
        /fetch failed|ENOTFOUND|getaddrinfo|network|timed out|ECONNREFUSED/i.test(
          error.message || ""
        );

      console.error("[LOGIN API] Supabase login failed:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: isNetworkIssue
            ? "The authentication service is currently unavailable. Please check your connection or try again in a moment."
            : error.message || "Login failed. Please try again.",
        },
        { status: isNetworkIssue ? 503 : 401 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[LOGIN API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "We could not reach the authentication service. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
