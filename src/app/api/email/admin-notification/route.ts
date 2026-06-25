import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendAdminNotificationEmail } from "@/lib/services/emailHelper";

/**
 * ADMIN NOTIFICATIONS API
 * Sends email notifications to admin about:
 * - New orders
 * - Low stock alerts
 * - New reviews
 * - System alerts
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationType, data } = body;

    if (!notificationType) {
      return NextResponse.json(
        { success: false, error: "notificationType is required" },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;

    if (!adminEmail) {
      console.error("[ADMIN NOTIFY] Admin email not configured");
      return NextResponse.json(
        { success: false, error: "Admin email not configured" },
        { status: 500 }
      );
    }

    console.log(`[ADMIN NOTIFY] Notification type: ${notificationType}`);

    const success = await sendAdminNotificationEmail(
      notificationType,
      data,
      adminEmail
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Admin notification sent for ${notificationType}`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send admin notification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[ADMIN NOTIFY] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
