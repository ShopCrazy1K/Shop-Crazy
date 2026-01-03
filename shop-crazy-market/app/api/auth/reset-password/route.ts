import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/auth/reset-password
 * Reset user password with token
 */
export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or token" },
        { status: 400 }
      );
    }

    // Verify token
    try {
      const tokenData = Buffer.from(token, "base64url").toString("utf-8");
      const [userId, expiryTime, resetToken] = tokenData.split(":");
      
      // Verify user ID matches
      if (userId !== user.id) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 400 }
        );
      }
      
      // Verify token hasn't expired
      const expiryDate = new Date(parseInt(expiryTime));
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: "Reset token has expired. Please request a new one." },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }
    
    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    console.log(`[PASSWORD RESET] Password reset successful for ${email}`);

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

