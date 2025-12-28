import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["general", "error", "concern", "feedback"]).default("general"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, email, subject, message, type } = parsed.data;

    // Determine subject line based on type
    const typeLabels: Record<string, string> = {
      general: "General Inquiry",
      error: "Error Report",
      concern: "Concern or Issue",
      feedback: "Feedback or Suggestion",
    };

    const emailSubject = subject || `${typeLabels[type]} from ${name}`;

    // Create HTML email template
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #9333ea, #7c3aed);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: 600;
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .field-value {
              color: #111827;
              font-size: 16px;
              padding: 10px;
              background: white;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .message-box {
              background: white;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
            }
            .type-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .type-general { background: #dbeafe; color: #1e40af; }
            .type-error { background: #fee2e2; color: #991b1b; }
            .type-concern { background: #fef3c7; color: #92400e; }
            .type-feedback { background: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">📧 New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Shop Crazy Market</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="field-label">Message Type</div>
              <div class="field-value">
                <span class="type-badge type-${type}">${typeLabels[type]}</span>
              </div>
            </div>

            <div class="field">
              <div class="field-label">From</div>
              <div class="field-value">${name}</div>
            </div>

            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">
                <a href="mailto:${email}" style="color: #9333ea; text-decoration: none;">${email}</a>
              </div>
            </div>

            ${subject ? `
            <div class="field">
              <div class="field-label">Subject</div>
              <div class="field-value">${subject}</div>
            </div>
            ` : ''}

            <div class="field">
              <div class="field-label">Message</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>

          <div class="footer">
            <p>This message was sent from the Shop Crazy Market contact form.</p>
            <p>You can reply directly to this email to respond to ${name}.</p>
          </div>
        </body>
      </html>
    `;

    // Send email to support/admin
    // You can set this to your support email or use an environment variable
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "support@shopcrazymarket.com";
    
    const emailResult = await sendEmail({
      to: supportEmail,
      subject: emailSubject,
      html: htmlEmail,
    });

    if (!emailResult.success) {
      console.error("[CONTACT API] Failed to send email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    // Also send a confirmation email to the user
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #9333ea, #7c3aed);
              color: white;
              padding: 30px;
              border-radius: 8px;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              margin-top: 20px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 12px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">✅ Message Received!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for contacting Shop Crazy Market! We've received your ${typeLabels[type].toLowerCase()} and will review it shortly.</p>
            <p><strong>Your message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #9333ea; margin: 15px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p>We'll get back to you as soon as possible. In the meantime, feel free to browse our marketplace!</p>
            <p style="margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://shopcrazymarket.com'}/marketplace" 
                 style="background: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Visit Marketplace
              </a>
            </p>
          </div>

          <div class="footer">
            <p>Shop Crazy Market Team</p>
            <p>This is an automated confirmation email.</p>
          </div>
        </body>
      </html>
    `;

    // Send confirmation to user (optional, but nice to have)
    await sendEmail({
      to: email,
      subject: `We received your ${typeLabels[type].toLowerCase()} - Shop Crazy Market`,
      html: confirmationHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
    });
  } catch (error: any) {
    console.error("[CONTACT API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process contact form" },
      { status: 500 }
    );
  }
}

