import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/lib/services/emailHelper";

export async function POST(request: Request) {
  try {
    console.log("[RESEND EMAIL API] Request received");
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    console.log(`[RESEND EMAIL API] Resending verification for: ${email}`);

    const supabase = await createClient();

    // Step 1: Resend verification via Supabase
    console.log(`[RESEND EMAIL API] Requesting resend from Supabase...`);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (resendError) {
      console.error(`[RESEND EMAIL API] Supabase error:`, resendError.message);
      return NextResponse.json(
        { success: false, error: resendError.message },
        { status: 400 }
      );
    }

    console.log(`[RESEND EMAIL API] ✓ Resend requested from Supabase`);

    // Step 2: Get user name from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("email", email)
      .single();

    const userName = profile?.full_name || "User";

    // Step 3: Send verification email via Gmail
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`;
    
    console.log(`[RESEND EMAIL API] Sending verification email via Gmail...`);
    const emailSent = await sendVerificationEmail(
      email,
      userName,
      verificationLink
    );

    if (emailSent) {
      console.log(`[RESEND EMAIL API] ✓ Verification email sent via Gmail`);
      return NextResponse.json({
        success: true,
        message: "Verification email resent to " + email,
      });
    } else {
      console.warn(`[RESEND EMAIL API] Gmail email send failed`);
      return NextResponse.json({
        success: false,
        error: "Failed to send verification email",
      });
    }
  } catch (error) {
    console.error("[RESEND EMAIL API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
