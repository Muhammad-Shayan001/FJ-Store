import * as nodemailer from "nodemailer";

// Create transporter on demand instead of at module load time
function createTransporter() {
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;

  console.log("[TRANSPORTER] Creating Gmail transporter...");
  console.log("[TRANSPORTER] Email configured:", email ? `${email.substring(0, 8)}...` : "NOT SET");
  console.log("[TRANSPORTER] Password configured:", password ? "YES (length: " + password.length + ")" : "NOT SET");

  if (password && password.includes("your-app-password")) {
    throw new Error("Please replace the placeholder SMTP password in .env.local with your real Gmail app password.");
  }

  if (!email || !password) {
    const error = new Error(
      "Missing Gmail credentials. Check .env.local:\n" +
      `  SMTP_EMAIL=${email ? "✓" : "✗"}\n` +
      `  SMTP_PASSWORD=${password ? "✓" : "✗"}`
    );
    console.error("[TRANSPORTER]", error.message);
    throw error;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: password,
      },
    });

    console.log("[TRANSPORTER] ✓ Gmail transporter created successfully");
    return transporter;
  } catch (error) {
    console.error("[TRANSPORTER] Failed to create transporter:", error);
    throw error;
  }
}

export interface EmailOptions {
  to: string;
  subject: string;
  template: "order_confirmation" | "password_reset" | "email_verification" | "invoice" | "order_status" | "admin_notification" | "newsletter";
  data: Record<string, unknown>;
}

interface OrderStatusEmailData {
  orderId: string;
  status: string;
  customerName: string;
  message?: string;
  reviewPrompt?: boolean;
  updatedAt: string;
}

type EmailTemplateData = Record<string, unknown>;

const emailTemplates: Record<string, (data: EmailTemplateData) => { html: string; text: string }> = {
  order_confirmation: (data) => {
    const typedData = data as {
      customerName?: string;
      orderId?: string;
      orderDate?: string;
      status?: string;
      items?: Array<{ name?: string; quantity?: number; price?: number }>;
      subtotal?: number;
      shipping?: number;
      tax?: number;
      discount?: number;
      grandTotal?: number;
      shippingAddress?: string;
    };
    const items = typedData.items || [];
    const itemRows = items
      .map((item) => `<tr><td style="border: 1px solid #ddd; padding: 10px;">${item.name || "Item"}</td><td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.quantity ?? 0}</td><td style="border: 1px solid #ddd; padding: 10px; text-align: right;">PKR ${((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}</td></tr>`)
      .join("");
    const orderTextLines = items
      .map((item) => `${item.name || "Item"} x${item.quantity ?? 0}: PKR ${((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}`)
      .join("\n");

    return {
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Order Confirmed!</h2>
        <p>Dear ${typedData.customerName || 'Customer'},</p>
        <p>Thank you for your order! Your order has been successfully placed.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <h3 style="color: #333;">Order Details</h3>
        <p><strong>Order ID:</strong> ${typedData.orderId}</p>
        <p><strong>Order Date:</strong> ${typedData.orderDate}</p>
        <p><strong>Status:</strong> ${typedData.status}</p>
        
        <h3 style="color: #333;">Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Item</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Qty</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Price</th>
          </tr>
          ${itemRows}
        </table>
        
        <hr style="border: none; border-top: 2px solid #d4af37; margin: 20px 0;">
        <div style="text-align: right; font-size: 18px; font-weight: bold; margin: 20px 0;">
          <span style="color: #333;">Total: </span>
          <span style="color: #d4af37;">PKR ${((typedData.grandTotal ?? 0)).toLocaleString()}</span>
        </div>
        
        <h3 style="color: #333;">Shipping Address</h3>
        <p>${typedData.shippingAddress}</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          You can track your order and view details at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fjstore.pk'}/account/orders/${typedData.orderId}" style="color: #d4af37;">View Your Order</a>
        </p>
        
        <p style="color: #666; font-size: 12px;">
          If you have any questions, please contact us at support@fjstore.pk
        </p>
      </div>
    `,
      text: `
      Order Confirmed!
      
      Dear ${typedData.customerName || 'Customer'},
      
      Thank you for your order! Your order has been successfully placed.
      
      Order Details:
      Order ID: ${typedData.orderId}
      Order Date: ${typedData.orderDate}
      Status: ${typedData.status}
      
      Items:
      ${orderTextLines}
      
      Total: PKR ${((typedData.grandTotal ?? 0)).toLocaleString()}
      
      Shipping Address:
      ${typedData.shippingAddress}
      
      Thank you for shopping with FJ Store Pakistan!
    `,
    };
  },

  order_status: (data: EmailTemplateData) => {
    const typedData = data as unknown as OrderStatusEmailData;
    return {
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Order Update</h2>
        <p>Dear ${typedData.customerName},</p>
        <p>Your order status has been updated.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${typedData.orderId}</p>
          <p><strong>New Status:</strong> <span style="color: #d4af37; font-weight: bold;">${typedData.status}</span></p>
          <p><strong>Updated:</strong> ${typedData.updatedAt}</p>
        </div>
        
        ${data.message ? `<p>${data.message}</p>` : ''}
        
        ${data.reviewPrompt ? `<p style="margin-top: 16px;">Once you receive your delivery, please come back and leave a review for your purchase. Your feedback helps us improve.</p>` : ''}
        
        <p style="color: #666; font-size: 12px;">
          Track your order: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fjstore.pk'}/account/orders/${typedData.orderId}" style="color: #d4af37;">View Order</a>
        </p>
      </div>
    `,
    text: `
      Order Update
      
      Dear ${typedData.customerName},
      
      Your order status has been updated.
      
      Order ID: ${typedData.orderId}
      New Status: ${typedData.status}
      Updated: ${typedData.updatedAt}
      
      ${typedData.message || ''}
      
      ${typedData.reviewPrompt ? "Once you receive your delivery, please come back and leave a review for your purchase. Your feedback helps us improve." : ''}
    `,
    };
  },

  password_reset: (data: EmailTemplateData) => {
    const typedData = data as { customerName?: string; resetLink?: string };
    return {
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Password Reset Request</h2>
        <p>Dear ${typedData.customerName || 'User'},</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${typedData.resetLink}" style="background-color: #d4af37; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          This link will expire in 24 hours. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
      text: `
      Password Reset Request
      
      Dear ${typedData.customerName || 'User'},
      
      We received a request to reset your password. Click the link below to proceed:
      
      ${typedData.resetLink}
      
      This link will expire in 24 hours.
    `,
    };
  },

  email_verification: (data: EmailTemplateData) => {
    const typedData = data as { customerName?: string; verificationLink?: string };
    return {
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Verify Your Email Address</h2>
        <p>Dear ${typedData.customerName || 'User'},</p>
        <p>Welcome to FJ Store Pakistan! Please verify your email address to complete your registration.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${typedData.verificationLink}" style="background-color: #d4af37; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          This link will expire in 24 hours. If you didn't create this account, please ignore this email.
        </p>
      </div>
    `,
      text: `
      Verify Your Email Address
      
      Dear ${typedData.customerName || 'User'},
      
      Welcome to FJ Store Pakistan! Please verify your email address by clicking the link below:
      
      ${typedData.verificationLink}
      
      This link will expire in 24 hours.
    `,
    };
  },

  invoice: (data: EmailTemplateData) => {
    const typedData = data as {
      orderId?: string;
      customerName?: string;
      subtotal?: number;
      shipping?: number;
      tax?: number;
      discount?: number;
      grandTotal?: number;
    };
    const discountValue = typedData.discount ?? 0;
    return {
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Invoice for Order #${typedData.orderId}</h2>
        <p>Dear ${typedData.customerName},</p>
        <p>Your invoice is attached to this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        
        <h3 style="color: #333;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px;"><strong>Subtotal:</strong></td>
            <td style="padding: 10px; text-align: right;">PKR ${((typedData.subtotal ?? 0)).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Shipping:</strong></td>
            <td style="padding: 10px; text-align: right;">PKR ${((typedData.shipping ?? 0)).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Tax:</strong></td>
            <td style="padding: 10px; text-align: right;">PKR ${((typedData.tax ?? 0)).toLocaleString()}</td>
          </tr>
          ${discountValue > 0 ? `
            <tr style="background-color: #f0f0f0;">
              <td style="padding: 10px;"><strong>Discount:</strong></td>
              <td style="padding: 10px; text-align: right;">-PKR ${discountValue.toLocaleString()}</td>
            </tr>
          ` : ''}
          <tr style="background-color: #f9f9f9; border-top: 2px solid #d4af37;">
            <td style="padding: 10px; font-size: 16px;"><strong>Grand Total:</strong></td>
            <td style="padding: 10px; text-align: right; font-size: 16px; color: #d4af37;"><strong>PKR ${((typedData.grandTotal ?? 0)).toLocaleString()}</strong></td>
          </tr>
        </table>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Thank you for shopping with FJ Store Pakistan!
        </p>
      </div>
    `,
      text: `
      Invoice for Order #${typedData.orderId}
      
      Dear ${typedData.customerName},
      
      Your invoice is attached to this email.
      
      Order Summary:
      Subtotal: PKR ${((typedData.subtotal ?? 0)).toLocaleString()}
      Shipping: PKR ${((typedData.shipping ?? 0)).toLocaleString()}
      Tax: PKR ${((typedData.tax ?? 0)).toLocaleString()}
      ${discountValue > 0 ? `Discount: -PKR ${discountValue.toLocaleString()}` : ''}
      
      Grand Total: PKR ${((typedData.grandTotal ?? 0)).toLocaleString()}
      
      Thank you for shopping with FJ Store Pakistan!
    `,
    };
  },

  admin_notification: (data) => {
    const notificationType = data.notificationType;
    let notificationTitle = "Admin Notification";
    let notificationContent = "";

    switch (notificationType) {
      case "new_order":
        notificationTitle = "🛍️ New Order Received";
        notificationContent = `
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Email:</strong> ${data.customerEmail}</p>
          <p><strong>Total Amount:</strong> PKR ${data.grandTotal?.toLocaleString()}</p>
          <p><strong>Items:</strong> ${data.itemCount || 0}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fjstore.pk'}/admin/orders/${data.orderId}" style="color: #d4af37;">View Order →</a></p>
        `;
        break;
      case "low_stock":
        notificationTitle = "⚠️ Low Stock Alert";
        notificationContent = `
          <p><strong>Product:</strong> ${data.productName}</p>
          <p><strong>Current Stock:</strong> ${data.currentStock}</p>
          <p><strong>Reorder Level:</strong> ${data.reorderLevel}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fjstore.pk'}/admin/inventory" style="color: #d4af37;">Manage Inventory →</a></p>
        `;
        break;
      case "new_review":
        notificationTitle = "⭐ New Review Submitted";
        notificationContent = `
          <p><strong>Product:</strong> ${data.productName}</p>
          <p><strong>Rating:</strong> ${data.rating}/5</p>
          <p><strong>Reviewer:</strong> ${data.reviewerName}</p>
          <p><strong>Comment:</strong> "${data.reviewComment}"</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fjstore.pk'}/admin/reviews" style="color: #d4af37;">Manage Reviews →</a></p>
        `;
        break;
      case "system_alert":
        notificationTitle = "🚨 System Alert";
        notificationContent = `
          <p><strong>Alert Type:</strong> ${data.alertType}</p>
          <p><strong>Message:</strong> ${data.message}</p>
          <p><strong>Severity:</strong> ${data.severity || "Normal"}</p>
        `;
        break;
    }

    return {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4af37;">${notificationTitle}</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${notificationContent}
          </div>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            <strong>Timestamp:</strong> ${data.timestamp}
          </p>
        </div>
      `,
      text: `
        ${notificationTitle}
        
        ${notificationContent.replace(/<[^>]*>/g, '')}
        
        Timestamp: ${data.timestamp}
      `,
    };
  },

  newsletter: (data) => ({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0b0b0c; padding: 20px; border-bottom: 3px solid #d4af37;">
          <h1 style="color: #d4af37; margin: 0;">FJ Store Newsletter</h1>
        </div>
        
        <div style="padding: 30px;">
          <p>Dear ${data.recipientName},</p>
          
          <div style="margin: 30px 0; line-height: 1.6; color: #333;">
            ${data.htmlContent}
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fjstore.pk'}/account/preferences" style="color: #d4af37;">Manage Newsletter Preferences</a>
          </p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            © 2026 FJ Store Pakistan. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
      FJ Store Newsletter
      
      Dear ${data.recipientName},
      
      ${data.textContent}
      
      Manage Newsletter Preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fjstore.pk'}/account/preferences
      
      © 2026 FJ Store Pakistan. All rights reserved.
    `,
  }),
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log(`\n[EMAIL SERVICE] ========================================`);
    console.log(`[EMAIL SERVICE] Starting email send process...`);
    console.log(`[EMAIL SERVICE] Template: ${options.template}`);
    console.log(`[EMAIL SERVICE] To: ${options.to}`);
    console.log(`[EMAIL SERVICE] Subject: ${options.subject}`);

    const template = emailTemplates[options.template];
    if (!template) {
      console.error(`[EMAIL SERVICE] Template not found: ${options.template}`);
      console.error(`[EMAIL SERVICE] Available templates:`, Object.keys(emailTemplates));
      return false;
    }

    console.log(`[EMAIL SERVICE] ✓ Template found`);

    const { html, text } = template(options.data);
    console.log(`[EMAIL SERVICE] ✓ Template rendered (HTML: ${html.length} chars, Text: ${text.length} chars)`);

    // Create transporter on demand
    console.log(`[EMAIL SERVICE] Creating transporter...`);
    const transporter = createTransporter();
    console.log(`[EMAIL SERVICE] ✓ Transporter created`);

    const mailOptions = {
      from: `${process.env.SMTP_SENDER_NAME || "FJ Store"} <${process.env.SMTP_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html,
      text,
    };

    console.log(`[EMAIL SERVICE] ✓ Mail options prepared`);
    console.log(`[EMAIL SERVICE] Sending via Gmail SMTP...`);

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`[EMAIL SERVICE] ✓✓✓ EMAIL SENT SUCCESSFULLY ✓✓✓`);
    console.log(`[EMAIL SERVICE] Message ID: ${info.messageId}`);
    console.log(`[EMAIL SERVICE] Response: ${info.response}`);
    console.log(`[EMAIL SERVICE] ========================================\n`);
    return true;
  } catch (error) {
    console.error(`\n[EMAIL SERVICE] ✗✗✗ EMAIL SEND FAILED ✗✗✗`);
    if (error instanceof Error) {
      console.error(`[EMAIL SERVICE] Error type: ${error.constructor.name}`);
      console.error(`[EMAIL SERVICE] Error message: ${error.message}`);
      const typedError = error as Error & { code?: string; status?: string };
      console.error(`[EMAIL SERVICE] Error code: ${typedError.code ?? "unknown"}`);
      console.error(`[EMAIL SERVICE] Error status: ${typedError.status ?? "unknown"}`);
    } else if (typeof error === "object" && error !== null) {
      const typedError = error as { code?: string; status?: string };
      console.error(`[EMAIL SERVICE] Error code: ${typedError.code ?? "unknown"}`);
      console.error(`[EMAIL SERVICE] Error status: ${typedError.status ?? "unknown"}`);
    } else {
      console.error(`[EMAIL SERVICE] Unknown error:`, error);
    }
    console.error(`[EMAIL SERVICE] ========================================\n`);
    return false;
  }
}
