import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/services/emailService";

/**
 * TEST EMAIL ENDPOINT
 * Usage: POST /api/email/test
 * Body: { email: "your@email.com" }
 * 
 * This endpoint is for testing ONLY and should be removed in production
 */

export async function POST(request: Request) {
  try {
    console.log("[EMAIL TEST] Test email endpoint called");
    
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Missing email parameter" },
        { status: 400 }
      );
    }

    console.log(`[EMAIL TEST] Testing email service with: ${email}`);

    // Check environment variables
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const senderName = process.env.SMTP_SENDER_NAME;

    console.log(`[EMAIL TEST] Config Check:`);
    console.log(`  - SMTP Email: ${smtpEmail ? "✓ Set" : "✗ Missing"}`);
    console.log(`  - SMTP Password: ${smtpPassword ? "✓ Set" : "✗ Missing"}`);
    console.log(`  - Sender Name: ${senderName ? "✓ Set" : "✗ Missing"}`);

    if (!smtpEmail || !smtpPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "SMTP credentials not configured. Check .env.local for SMTP_EMAIL and SMTP_PASSWORD",
        },
        { status: 500 }
      );
    }

    // Send test email
    const success = await sendEmail({
      to: email,
      subject: "FJ Store - Email Configuration Test ✓",
      template: "order_confirmation",
      data: {
        customerName: "Test User",
        orderId: "TEST001",
        orderDate: new Date().toLocaleDateString(),
        status: "Test Email",
        items: [
          { name: "Test Product", quantity: 1, price: 5000 },
        ],
        subtotal: 5000,
        shipping: 500,
        tax: 0,
        discount: 0,
        grandTotal: 5500,
        shippingAddress: "Test Address, Pakistan",
      },
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully! Check your inbox.",
        email,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test email. Check server logs for details.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[EMAIL TEST] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
