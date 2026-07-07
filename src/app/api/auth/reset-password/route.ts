import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/services/emailHelper";

export async function POST(request: Request) {
  try {
    console.log("[PASSWORD RESET API] Request received");
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    console.log(`[PASSWORD RESET API] Processing reset request for: ${email}`);

    const supabase = await createClient();

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://fj-store.vercel.app";
    const redirectTo = `${origin}/update-password`;

    // Request password reset from Supabase
    // Supabase will automatically send the email using its built-in email service
    console.log(`[PASSWORD RESET API] Requesting reset token from Supabase with redirect: ${redirectTo}`);
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      console.error(`[PASSWORD RESET API] Supabase error:`, resetError.message);
      
      // Detect rate limit error
      if (resetError.message.toLowerCase().includes("rate limit") || resetError.message.toLowerCase().includes("too many")) {
        console.warn(`[PASSWORD RESET API] ⏱️  Rate limit hit - user requested too many reset emails`);
        return NextResponse.json(
          { 
            success: false, 
            error: "Too many password reset requests. Please wait 15 minutes before trying again.",
            code: "RATE_LIMIT"
          },
          { 
            status: 429,
            headers: {
              "Retry-After": "900", // 15 minutes
            }
          }
        );
      }
      
      return NextResponse.json(
        { success: false, error: resetError.message },
        { status: 400 }
      );
    }

    console.log(`[PASSWORD RESET API] ✓ Reset email sent successfully via Supabase Auth`);

    return NextResponse.json({
      success: true,
      message: "Password reset email sent successfully! Check your inbox.",
    });
  } catch (error) {
    console.error("[PASSWORD RESET API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
