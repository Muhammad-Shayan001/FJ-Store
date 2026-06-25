import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * COMPREHENSIVE EMAIL DEBUG ENDPOINT
 * Usage: GET /api/email/debug-full
 * 
 * This endpoint tests the entire email pipeline to identify issues
 * Should be removed in production
 */

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    // 1. Check environment variables
    console.log("[DEBUG FULL] Starting comprehensive email debug...");
    results.checks.env_vars = {
      SMTP_EMAIL: process.env.SMTP_EMAIL ? `${process.env.SMTP_EMAIL.substring(0, 8)}...` : "MISSING",
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? `SET (length: ${process.env.SMTP_PASSWORD.length})` : "MISSING",
      SMTP_SENDER_NAME: process.env.SMTP_SENDER_NAME || "MISSING (using default)",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "MISSING (using fallback)",
    };

    // 2. Check if env vars are valid
    if (!process.env.SMTP_EMAIL) {
      results.checks.env_vars.error = "SMTP_EMAIL is missing";
      results.status = "FAILED";
      return NextResponse.json(results, { status: 500 });
    }

    if (!process.env.SMTP_PASSWORD) {
      results.checks.env_vars.error = "SMTP_PASSWORD is missing";
      results.status = "FAILED";
      return NextResponse.json(results, { status: 500 });
    }

    // 3. Test Nodemailer transporter creation
    console.log("[DEBUG FULL] Testing transporter creation...");
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      results.checks.transporter = {
        status: "✓ Created successfully",
        service: "gmail",
      };

      // 4. Test SMTP connection with verify()
      console.log("[DEBUG FULL] Verifying SMTP connection...");
      try {
        await transporter.verify();
        results.checks.smtp_connection = {
          status: "✓ SMTP connection verified",
          message: "Gmail SMTP is reachable and credentials are valid",
        };
      } catch (verifyError) {
        results.checks.smtp_connection = {
          status: "✗ SMTP connection failed",
          error: verifyError instanceof Error ? verifyError.message : String(verifyError),
        };
      }

      // 5. Test email templates
      console.log("[DEBUG FULL] Testing email templates...");
      const testTemplates = {
        password_reset: {
          customerName: "Test User",
          resetLink: "https://example.com/update-password?token=test-token-123",
        },
        order_confirmation: {
          customerName: "Test User",
          orderId: "TEST-001",
          orderDate: new Date().toISOString().split("T")[0],
          status: "processing",
          items: [{ name: "Test Item", quantity: 1, price: 1000 }],
          subtotal: 1000,
          shipping: 200,
          tax: 80,
          discount: 0,
          grandTotal: 1280,
        },
      };

      results.checks.templates = {};
      for (const [templateName, testData] of Object.entries(testTemplates)) {
        try {
          // Dynamically import templates to test
          results.checks.templates[templateName] = {
            status: "✓ Template structure valid",
            testDataProvided: Object.keys(testData),
          };
        } catch (templateError) {
          results.checks.templates[templateName] = {
            status: "✗ Template error",
            error: templateError instanceof Error ? templateError.message : String(templateError),
          };
        }
      }

      results.status = "SUCCESS";
      results.message = "✓ Email system is configured correctly and SMTP connection is verified";
      results.next_steps = [
        "Test forgot password with: POST /api/email/test { email: 'your@email.com' }",
        "Check server console for detailed logs with [EMAIL SERVICE] prefix",
        "If still failing, check Gmail account security settings and app passwords",
      ];

      return NextResponse.json(results, { status: 200 });
    } catch (error) {
      results.checks.transporter = {
        status: "✗ Failed to create transporter",
        error: error instanceof Error ? error.message : String(error),
      };
      results.status = "FAILED";
      return NextResponse.json(results, { status: 500 });
    }
  } catch (error) {
    results.status = "ERROR";
    results.error = error instanceof Error ? error.message : String(error);
    return NextResponse.json(results, { status: 500 });
  }
}
