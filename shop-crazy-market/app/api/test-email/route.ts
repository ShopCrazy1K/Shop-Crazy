import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/test-email
 * Test email sending with Resend
 * 
 * Body: { to: "email@example.com" }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Email address (to) is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    const testEmailHtml = `
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
          }
          .success {
            background-color: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
          }
          .info {
            background-color: #f9fafb;
            border-left: 4px solid #7c3aed;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Email Test Successful!</h1>
          </div>
          
          <div class="success">
            ✅ Your Resend email integration is working perfectly!
          </div>

          <div class="info">
            <h3>Test Details:</h3>
            <ul>
              <li><strong>Service:</strong> Resend</li>
              <li><strong>Sent To:</strong> ${to}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>Status:</strong> Delivered</li>
            </ul>
          </div>

          <p>If you received this email, your Resend API key is configured correctly and order confirmation emails will be sent automatically when customers complete purchases.</p>

          <div class="footer">
            <p>This is a test email from Shop Crazy Market</p>
            <p>Order confirmation emails will use this same email service.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await sendEmail({
        to,
        subject: "✅ Shop Crazy Market - Email Test Successful!",
        html: testEmailHtml,
      });

      if (result) {
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${to}`,
          timestamp: new Date().toISOString(),
          config: {
            hasResendKey: !!process.env.RESEND_API_KEY,
            hasSmtpConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
            emailFrom: process.env.EMAIL_FROM || "Not set",
            resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) || "Not set",
          },
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to send email. Check Vercel function logs for Resend error details.",
            config: {
              hasResendKey: !!process.env.RESEND_API_KEY,
              hasSmtpConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
              emailFrom: process.env.EMAIL_FROM || "Not set",
              resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) || "Not set",
            },
            troubleshooting: [
              "Check Vercel function logs for detailed error message",
              "Verify RESEND_API_KEY is correct in Vercel environment variables",
              "Check if your domain is verified in Resend dashboard (if using custom domain)",
              "Verify EMAIL_FROM format is correct: 'Name <email@domain.com>'",
            ],
          },
          { status: 500 }
        );
      }
    } catch (emailError: any) {
      console.error("Test email error:", emailError);
      return NextResponse.json(
        {
          success: false,
          error: emailError.message || "Failed to send test email",
          config: {
            hasResendKey: !!process.env.RESEND_API_KEY,
            hasSmtpConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
            emailFrom: process.env.EMAIL_FROM || "Not set",
          },
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test email",
        config: {
          hasResendKey: !!process.env.RESEND_API_KEY,
          hasSmtpConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
          emailFrom: process.env.EMAIL_FROM || "Not set",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test-email
 * Check email configuration status
 */
export async function GET() {
  return NextResponse.json({
    config: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasSmtpConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      emailFrom: process.env.EMAIL_FROM || "Not set",
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
    },
    message: "Use POST /api/test-email with { to: 'your-email@example.com' } to send a test email",
  });
}

