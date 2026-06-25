import { NextResponse } from "next/server";

export async function GET() {
  console.log("[DEBUG] Checking email configuration...");

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpSenderName = process.env.SMTP_SENDER_NAME;

  console.log("[DEBUG] SMTP_EMAIL:", smtpEmail ? "SET" : "NOT SET");
  console.log("[DEBUG] SMTP_PASSWORD:", smtpPassword ? `SET (${smtpPassword.length} chars)` : "NOT SET");
  console.log("[DEBUG] SMTP_SENDER_NAME:", smtpSenderName ? "SET" : "NOT SET");

  return NextResponse.json({
    config: {
      smtpEmail: !!smtpEmail,
      smtpPassword: !!smtpPassword,
      smtpSenderName: !!smtpSenderName,
    },
  });
}
