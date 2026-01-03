import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/auth/forgot-username
 * Send username to user's email
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
      select: { id: true, email: true, username: true },
    });

    // Don't reveal if email exists or not (security best practice)
    // But we'll still send email if user exists
    if (user) {
      const username = user.username || "Not set";
      
      // Send email with username
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Your Username - Shop Crazy Market",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #9333ea;">Shop Crazy Market</h1>
            <h2>Your Username</h2>
            <p>Hello,</p>
            <p>You requested your username. Here it is:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Username:</strong> ${username}
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 12px;">
              Shop Crazy Market - Your trusted marketplace
            </p>
          </div>
        `,
      });

      if (!emailResult.success) {
        console.error("Failed to send username email:", emailResult.error);
        // Still return success to user (don't reveal email issues)
      }
    }

    // Always return success (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, your username has been sent.",
    });
  } catch (error: any) {
    console.error("Error in forgot-username:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

