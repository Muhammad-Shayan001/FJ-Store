/**
 * Email Helper Utility
 * Centralized email sending functions for common operations like:
 * - Order confirmation
 * - Order status updates
 * - Password reset
 * - Invoice delivery
 * - Email verification
 */

interface SendEmailParams {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  orderDate: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  subtotal: number,
  shipping: number,
  tax: number,
  discount: number,
  grandTotal: number,
  shippingAddress: string
): Promise<boolean> {
  try {
    console.log(`[EMAIL HELPER] Sending order confirmation to ${customerEmail}`);
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: `Order Confirmation - Order #${orderId.substring(0, 8).toUpperCase()}`,
        template: "order_confirmation",
        data: {
          customerName,
          orderId: orderId.substring(0, 8).toUpperCase(),
          orderDate,
          status: "Pending",
          items,
          subtotal,
          shipping,
          tax,
          discount,
          grandTotal,
          shippingAddress,
        },
      } as SendEmailParams),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`[EMAIL HELPER] ✓ Order confirmation sent to ${customerEmail}`);
      return true;
    } else {
      console.warn(`[EMAIL HELPER] ✗ Order confirmation failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`[EMAIL HELPER] Error sending order confirmation:`, error);
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  newStatus: string,
  message?: string,
  reviewPrompt?: boolean
): Promise<boolean> {
  try {
    console.log(`[EMAIL HELPER] Sending status update to ${customerEmail}: ${newStatus}`);
    const baseUrl = typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      : "";

    const response = await fetch(`${baseUrl}/api/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: `Order Update: ${newStatus} - Order #${orderId.substring(0, 8).toUpperCase()}`,
        template: "order_status",
        data: {
          orderId: orderId.substring(0, 8).toUpperCase(),
          status: newStatus,
          customerName,
          message,
          reviewPrompt,
          updatedAt: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      } as SendEmailParams),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`[EMAIL HELPER] ✓ Status update sent to ${customerEmail}`);
      return true;
    } else {
      console.warn(`[EMAIL HELPER] ✗ Status update failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`[EMAIL HELPER] Error sending status update email:`, error);
    return false;
  }
}

export async function sendInvoiceEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  subtotal: number,
  shipping: number,
  tax: number,
  discount: number,
  grandTotal: number
): Promise<boolean> {
  try {
    console.log(`[EMAIL HELPER] Sending invoice to ${customerEmail}`);
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: `Invoice - Order #${orderId.substring(0, 8).toUpperCase()}`,
        template: "invoice",
        data: {
          customerName,
          orderId: orderId.substring(0, 8).toUpperCase(),
          subtotal,
          shipping,
          tax,
          discount,
          grandTotal,
        },
      } as SendEmailParams),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`[EMAIL HELPER] ✓ Invoice sent to ${customerEmail}`);
      return true;
    } else {
      console.warn(`[EMAIL HELPER] ✗ Invoice send failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`[EMAIL HELPER] Error sending invoice email:`, error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  customerEmail: string,
  customerName: string,
  resetLink: string
): Promise<boolean> {
  try {
    console.log(`[EMAIL HELPER] Sending password reset to ${customerEmail}`);
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: "Reset Your Password",
        template: "password_reset",
        data: {
          customerName,
          resetLink,
        },
      } as SendEmailParams),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`[EMAIL HELPER] ✓ Password reset sent to ${customerEmail}`);
      return true;
    } else {
      console.warn(`[EMAIL HELPER] ✗ Password reset send failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`[EMAIL HELPER] Error sending password reset email:`, error);
    return false;
  }
}

export async function sendVerificationEmail(
  customerEmail: string,
  customerName: string,
  verificationLink: string
): Promise<boolean> {
  try {
    console.log(`[EMAIL HELPER] Sending verification email to ${customerEmail}`);
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: customerEmail,
        subject: "Verify Your Email Address",
        template: "email_verification",
        data: {
          customerName,
          verificationLink,
        },
      } as SendEmailParams),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`[EMAIL HELPER] ✓ Verification email sent to ${customerEmail}`);
      return true;
    } else {
      console.warn(`[EMAIL HELPER] ✗ Verification email send failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`[EMAIL HELPER] Error sending verification email:`, error);
    return false;
  }
}

export async function sendAdminNotificationEmail(
  notificationType: string,
  data: Record<string, unknown>,
  adminEmail: string
): Promise<boolean> {
  try {
    console.log(`[EMAIL HELPER] Sending admin notification: ${notificationType}`);
    const typedData = data as {
      orderId?: string;
      productName?: string;
      alertType?: string;
      reviewerName?: string;
      rating?: number;
      reviewComment?: string;
      currentStock?: number;
      reorderLevel?: number;
    };

    let subject = "";

    switch (notificationType) {
      case "new_order":
        subject = `🛍️ New Order Received - Order #${typedData.orderId?.substring(0, 8).toUpperCase()}`;
        break;
      case "low_stock":
        subject = `⚠️ Low Stock Alert - ${typedData.productName}`;
        break;
      case "new_review":
        subject = `⭐ New Review - ${typedData.productName}`;
        break;
      case "system_alert":
        subject = `🚨 System Alert - ${typedData.alertType}`;
        break;
      default:
        subject = `Admin Notification - ${notificationType}`;
    }

    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: adminEmail,
        subject,
        template: "admin_notification",
        data: {
          notificationType,
          ...data,
          adminName: "Admin",
          timestamp: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        },
      } as SendEmailParams),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`[EMAIL HELPER] ✓ Admin notification sent for ${notificationType}`);
      return true;
    } else {
      console.warn(`[EMAIL HELPER] ✗ Admin notification failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`[EMAIL HELPER] Error sending admin notification:`, error);
    return false;
  }
}

export async function sendNewsletterEmail(
  recipientEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  recipientName?: string
): Promise<boolean> {
  try {
    console.log(`[EMAIL HELPER] Sending newsletter to ${recipientEmail}`);
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        template: "newsletter",
        data: {
          recipientName: recipientName || "Valued Customer",
          htmlContent,
          textContent,
        },
      } as SendEmailParams),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`[EMAIL HELPER] ✓ Newsletter sent to ${recipientEmail}`);
      return true;
    } else {
      console.warn(`[EMAIL HELPER] ✗ Newsletter send failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`[EMAIL HELPER] Error sending newsletter:`, error);
    return false;
  }
}

export async function sendBulkNewsletterEmails(
  recipients: Array<{ email: string; name?: string }>,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  console.log(`[EMAIL HELPER] Sending bulk newsletter to ${recipients.length} recipients`);

  for (const recipient of recipients) {
    const success = await sendNewsletterEmail(
      recipient.email,
      subject,
      htmlContent,
      textContent,
      recipient.name
    );
    
    if (success) {
      sent++;
    } else {
      failed++;
    }

    // Add delay between emails to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`[EMAIL HELPER] Bulk newsletter complete - Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}
