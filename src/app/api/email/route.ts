import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/services/emailService";

export async function POST(request: Request) {
  try {
    console.log("[EMAIL API] Received email request");
    
    const body = await request.json();
    const { to, subject, template, data } = body;

    // Validate required fields
    if (!to || !subject || !template || !data) {
      console.error("[EMAIL API] Missing required fields:", { to: !!to, subject: !!subject, template: !!template, data: !!data });
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, subject, template, data" },
        { status: 400 }
      );
    }

    console.log(`[EMAIL API] Attempting to send email to: ${to}, template: ${template}`);
    
    const success = await sendEmail({
      to,
      subject,
      template,
      data,
    });

    if (success) {
      console.log(`[EMAIL API] ✓ Email API returned success for ${to}`);
      return NextResponse.json({ success: true, message: "Email sent successfully" });
    } else {
      console.log(`[EMAIL API] ✗ Email API returned failure for ${to}`);
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[EMAIL API] Error:", error instanceof Error ? error.message : error);
    console.error("[EMAIL API] Full error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
