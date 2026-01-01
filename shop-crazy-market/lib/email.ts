// Email notification system
// Supports both Resend (recommended) and Nodemailer fallback

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html, from } = options;

  // Use Resend if API key is available
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const emailFrom = from || process.env.EMAIL_FROM || "Shop Crazy Market <onboarding@resend.dev>";
      
      console.log("[EMAIL] Attempting to send via Resend:", {
        to,
        from: emailFrom,
        subject,
        hasApiKey: !!process.env.RESEND_API_KEY,
      });

      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [to],
        subject,
        html,
      });

      if (error) {
        const errorDetails = {
          message: error.message,
          name: error.name,
          statusCode: (error as any).statusCode,
          fullError: error,
        };
        console.error("[EMAIL] Resend error:", JSON.stringify(errorDetails, null, 2));
        return { 
          success: false, 
          error: `Resend error: ${error.message || JSON.stringify(error)}` 
        };
      }

      if (data) {
        console.log("[EMAIL] Resend email sent successfully:", data.id);
      }

      return { success: true };
    } catch (error: any) {
      console.error("[EMAIL] Resend import/send exception:", error?.message || error);
      console.error("[EMAIL] Full error:", JSON.stringify(error, null, 2));
      return { 
        success: false, 
        error: `Resend exception: ${error?.message || String(error)}` 
      };
    }
  }

  // Fallback to Nodemailer (for development/testing)
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import("nodemailer");

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: from || process.env.EMAIL_FROM || "noreply@shopcrazymarket.com",
        to,
        subject,
        html,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Nodemailer error:", error);
      return { 
        success: false, 
        error: `SMTP error: ${error?.message || String(error)}` 
      };
    }
  }

  // Development mode: log email instead of sending
  console.log("📧 Email (dev mode):", { to, subject, html });
  return { success: true };
}

export async function sendAdminReportNotification(report: {
  id: string;
  productId?: string;
  listingId?: string;
  productTitle?: string;
  reporterEmail: string;
  reason: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@shopcrazymarket.com";

  const itemIdentifier = report.productTitle || report.productId || report.listingId || "Unknown Item";

  const html = `
    <h2>New Copyright Report</h2>
    <p>A new copyright violation report has been submitted.</p>
    <ul>
      <li><strong>Report ID:</strong> ${report.id}</li>
      <li><strong>Item Type:</strong> ${report.listingId ? "Listing" : report.productId ? "Product" : "Unknown"}</li>
      <li><strong>Item:</strong> ${itemIdentifier}</li>
      ${report.productId ? `<li><strong>Product ID:</strong> ${report.productId}</li>` : ""}
      ${report.listingId ? `<li><strong>Listing ID:</strong> ${report.listingId}</li>` : ""}
      <li><strong>Reporter:</strong> ${report.reporterEmail}</li>
      <li><strong>Reason:</strong> ${report.reason}</li>
    </ul>
    <p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/reports">
        Review Report →
      </a>
    </p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Copyright Report: ${itemIdentifier}`,
    html,
  });
}

export async function sendSellerNotification(
  sellerEmail: string,
  productTitle: string,
  reportReason: string
) {
  const html = `
    <h2>Product Reported for Copyright Violation</h2>
    <p>Your product "<strong>${productTitle}</strong>" has been reported for a copyright violation.</p>
    <p><strong>Report Reason:</strong> ${reportReason}</p>
    <p>We are reviewing this report. If you believe this is an error, you may appeal any strikes issued.</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/seller/dashboard">
        View Your Dashboard →
      </a>
    </p>
  `;

  return sendEmail({
    to: sellerEmail,
    subject: `Product Reported: ${productTitle}`,
    html,
  });
}

export async function sendStrikeNotification(
  sellerEmail: string,
  strikeReason: string,
  strikeId: string
) {
  const html = `
    <h2>Seller Strike Issued</h2>
    <p>A strike has been issued to your account for a copyright violation.</p>
    <p><strong>Reason:</strong> ${strikeReason}</p>
    <p>You can appeal this strike if you believe it was issued in error.</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/seller/strikes">
        View Strikes & Appeal →
      </a>
    </p>
  `;

  return sendEmail({
    to: sellerEmail,
    subject: "Seller Strike Issued - Shop Crazy Market",
    html,
  });
}

export async function sendAppealNotification(
  adminEmail: string,
  strikeId: string,
  shopName: string,
  appealReason: string
) {
  const html = `
    <h2>New Strike Appeal</h2>
    <p>A seller has submitted an appeal for a strike.</p>
    <ul>
      <li><strong>Strike ID:</strong> ${strikeId}</li>
      <li><strong>Shop:</strong> ${shopName}</li>
      <li><strong>Appeal Reason:</strong> ${appealReason}</li>
    </ul>
    <p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/reports">
        Review Appeal →
      </a>
    </p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Strike Appeal: ${shopName}`,
    html,
  });
}

export async function sendOrderConfirmationEmail(order: {
  id: string;
  orderTotalCents: number;
  currency: string;
  createdAt: Date;
  buyerEmail: string | null;
  listing: {
    id: string;
    title: string;
    digitalFiles: string[];
  };
}): Promise<{ success: boolean; error?: string }> {
  if (!order.buyerEmail) {
    console.log("[EMAIL] No buyer email for order, skipping email");
    return { success: false, error: "No buyer email" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com";
  const orderUrl = `${siteUrl}/orders/${order.id}`;
  const hasDigitalFiles = order.listing.digitalFiles && 
    Array.isArray(order.listing.digitalFiles) && 
    order.listing.digitalFiles.length > 0;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #7c3aed;
        }
        .header h1 {
          color: #7c3aed;
          margin: 0;
          font-size: 28px;
        }
        .success-badge {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-top: 10px;
        }
        .order-details {
          background-color: #f9fafb;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .order-details h2 {
          margin-top: 0;
          color: #1f2937;
          font-size: 20px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }
        .detail-value {
          color: #1f2937;
          font-weight: bold;
        }
        .total-row {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #7c3aed;
          font-size: 18px;
        }
        .digital-files {
          background-color: #eef2ff;
          border-left: 4px solid #7c3aed;
          padding: 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .digital-files h3 {
          margin-top: 0;
          color: #7c3aed;
        }
        .file-list {
          list-style: none;
          padding: 0;
          margin: 15px 0;
        }
        .file-list li {
          padding: 8px 0;
          border-bottom: 1px solid #c7d2fe;
        }
        .file-list li:last-child {
          border-bottom: none;
        }
        .button {
          display: inline-block;
          background-color: #7c3aed;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .button:hover {
          background-color: #6d28d9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .footer a {
          color: #7c3aed;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <div class="success-badge">Payment Successful</div>
        </div>

        <p>Thank you for your purchase! Your order has been confirmed and payment has been processed.</p>

        <div class="order-details">
          <h2>Order Details</h2>
          <div class="detail-row">
            <span class="detail-label">Order Number:</span>
            <span class="detail-value">#${order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Item:</span>
            <span class="detail-value">${order.listing.title}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order Date:</span>
            <span class="detail-value">${new Date(order.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div class="detail-row total-row">
            <span class="detail-label">Total Paid:</span>
            <span class="detail-value">${(order.orderTotalCents / 100).toFixed(2)} ${order.currency.toUpperCase()}</span>
          </div>
        </div>

        ${hasDigitalFiles ? `
        <div class="digital-files">
          <h3>💾 Your Digital Files</h3>
          <p>Your purchased digital files are ready for download:</p>
          <ul class="file-list">
            ${order.listing.digitalFiles.map((file: string) => {
              const fileName = file.split('/').pop() || 'File';
              return `<li>📄 ${fileName}</li>`;
            }).join('')}
          </ul>
          <p><strong>You can download your files anytime from your order page.</strong></p>
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${orderUrl}" class="button">View Order & Download Files</a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Need help? Contact us at <a href="mailto:support@shopcrazymarket.com" style="color: #7c3aed;">support@shopcrazymarket.com</a>
        </p>

        <div class="footer">
          <p>This is an automated email from Shop Crazy Market.</p>
          <p>
            <a href="${siteUrl}">Visit Shop Crazy Market</a> | 
            <a href="${siteUrl}/orders">View All Orders</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: order.buyerEmail,
    subject: `Order Confirmed - ${order.listing.title} | Shop Crazy Market`,
    html,
  });
}

export async function sendRefundStatusEmail(params: {
  to: string;
  orderId: string;
  refundType: "CREDIT" | "CASH";
  refundStatus: string;
  refundAmount: number;
  reason?: string | null;
  sellerNote?: string | null;
}) {
  const { to, orderId, refundType, refundStatus, refundAmount, reason, sellerNote } = params;

  let subject = "";
  let statusMessage = "";
  let actionMessage = "";

  switch (refundStatus) {
    case "REQUESTED":
      subject = `Refund Request Received - Order #${orderId.slice(0, 8)}`;
      statusMessage = "Your refund request has been received and is being reviewed.";
      actionMessage = "We'll notify you once your refund is processed.";
      break;
    case "APPROVED":
      subject = `Refund Approved - Order #${orderId.slice(0, 8)}`;
      statusMessage = "Your refund request has been approved!";
      actionMessage = refundType === "CREDIT"
        ? "Your store credit has been added to your account and is ready to use."
        : "Your cash refund is being processed and will appear in your account within 3-5 business days.";
      break;
    case "COMPLETED":
      subject = `Refund Completed - Order #${orderId.slice(0, 8)}`;
      statusMessage = "Your refund has been completed!";
      actionMessage = refundType === "CREDIT"
        ? "Your store credit is now available in your account."
        : "Your cash refund has been processed and should appear in your account soon.";
      break;
    case "REJECTED":
      subject = `Refund Request Update - Order #${orderId.slice(0, 8)}`;
      statusMessage = "Your refund request has been reviewed.";
      actionMessage = sellerNote
        ? `Reason: ${sellerNote}`
        : "Please contact support if you have questions.";
      break;
    default:
      subject = `Refund Status Update - Order #${orderId.slice(0, 8)}`;
      statusMessage = `Your refund status is now: ${refundStatus}`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Shop Crazy Market</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">${subject}</h2>
          <p>${statusMessage}</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${orderId.slice(0, 8)}</p>
            <p><strong>Refund Type:</strong> ${refundType === "CREDIT" ? "Store Credit" : "Cash Refund"}</p>
            <p><strong>Refund Amount:</strong> $${(refundAmount / 100).toFixed(2)}</p>
            ${reason ? `<p><strong>Your Reason:</strong> ${reason}</p>` : ""}
            ${sellerNote ? `<p><strong>Seller Note:</strong> ${sellerNote}</p>` : ""}
          </div>
          <p>${actionMessage}</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/orders/${orderId}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated email from Shop Crazy Market.</p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject,
    html,
  });
}

