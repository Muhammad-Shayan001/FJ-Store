import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userIds, title, message, isRead = false } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const recipients = userId ? [userId] : (userIds || []);
    if (!recipients.length) {
      return NextResponse.json({ success: false, error: "No recipients selected" }, { status: 400 });
    }

    const inserts = recipients.map((recipientId: string) => ({
      user_id: recipientId,
      title,
      message,
      is_read: isRead,
    }));

    const { error } = await supabase.from("notifications").insert(inserts);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: recipients.length === 1 ? "Notification sent successfully." : `Notification sent to ${recipients.length} users.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to send notification" },
      { status: 500 }
    );
  }
}
