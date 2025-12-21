// Email notification system
// Supports both Resend (recommended) and Nodemailer fallback

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, from } = options;

  // Use Resend if API key is available
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { error } = await resend.emails.send({
        from: from || process.env.EMAIL_FROM || "Shop Crazy Market <noreply@shopcrazymarket.com>",
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error("Resend error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Resend import error:", error);
      // Fall through to Nodemailer
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

      return true;
    } catch (error) {
      console.error("Nodemailer error:", error);
      return false;
    }
  }

  // Development mode: log email instead of sending
  console.log("📧 Email (dev mode):", { to, subject, html });
  return true;
}

export async function sendAdminReportNotification(report: {
  id: string;
  productId: string;
  productTitle?: string;
  reporterEmail: string;
  reason: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@shopcrazymarket.com";

  const html = `
    <h2>New Copyright Report</h2>
    <p>A new copyright violation report has been submitted.</p>
    <ul>
      <li><strong>Report ID:</strong> ${report.id}</li>
      <li><strong>Product:</strong> ${report.productTitle || report.productId}</li>
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
    subject: `New Copyright Report: ${report.productTitle || report.productId}`,
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

