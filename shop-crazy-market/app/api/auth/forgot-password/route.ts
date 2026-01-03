import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/auth/forgot-password
 * Send password reset link to user's email
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // Don't reveal if email exists or not (security best practice)
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Create a signed token that includes userId and expiry
      // Format: base64(userId:expiry:randomToken)
      const tokenData = `${user.id}:${resetTokenExpiry.getTime()}:${resetToken}`;
      const signedToken = Buffer.from(tokenData).toString("base64url");
      
      const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://shopcrazymarket.com"}/reset-password?token=${signedToken}&email=${encodeURIComponent(email)}`;
      
      // Send reset email
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Reset Your Password - Shop Crazy Market",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #9333ea;">Shop Crazy Market</h1>
            <h2>Reset Your Password</h2>
            <p>Hello,</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${resetLink}</p>
            <p style="color: #ef4444; font-size: 12px;">
              <strong>This link will expire in 1 hour.</strong>
            </p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 12px;">
              Shop Crazy Market - Your trusted marketplace
            </p>
          </div>
        `,
      });

      if (!emailResult.success) {
        console.error("Failed to send password reset email:", emailResult.error);
        // Still return success to user (don't reveal email issues)
      } else {
        console.log(`[PASSWORD RESET] Reset link sent to ${email}`);
      }
    }

    // Always return success (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, password reset instructions have been sent.",
    });
  } catch (error: any) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

