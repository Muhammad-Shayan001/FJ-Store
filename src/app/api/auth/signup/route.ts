import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/lib/services/emailHelper";

export async function POST(request: Request) {
  try {
    console.log("[SIGNUP API] Request received");
    
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`[SIGNUP API] Processing signup for: ${email}`);

    const supabase = await createClient();

    // Step 1: Create user via Supabase
    console.log(`[SIGNUP API] Creating user in Supabase...`);
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (signupError) {
      console.error(`[SIGNUP API] Signup error:`, signupError.message);
      return NextResponse.json(
        { success: false, error: signupError.message },
        { status: 400 }
      );
    }

    console.log(`[SIGNUP API] ✓ User created in Supabase`);

    // Step 2: Send verification email via Gmail (in addition to Supabase's default email)
    // This gives users a branded email from their Gmail account
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`;
    
    console.log(`[SIGNUP API] Sending verification email via Gmail...`);
    const emailSent = await sendVerificationEmail(
      email,
      fullName,
      verificationLink
    );

    if (emailSent) {
      console.log(`[SIGNUP API] ✓ Verification email sent via Gmail`);
    } else {
      console.warn(`[SIGNUP API] Gmail verification email failed (Supabase email was sent)`);
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Check your email for verification link.",
      data,
    });
  } catch (error) {
    console.error("[SIGNUP API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
