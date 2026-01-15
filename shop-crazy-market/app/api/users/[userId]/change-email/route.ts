import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/users/[userId]/change-email
 * Change user email address (requires password verification)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const requesterId = req.headers.get("x-user-id");
    const { newEmail, password } = await req.json();

    // Verify requester is the user themselves
    if (!requesterId || requesterId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: "New email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if new email is different from current email
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "New email must be different from current email" },
        { status: 400 }
      );
    }

    // Check if user has a password (OAuth users might not have one)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account does not have a password set. Please contact support to change your email." },
        { status: 400 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This email address is already in use" },
        { status: 400 }
      );
    }

    // Update email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail.toLowerCase() },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`[EMAIL CHANGE] Email changed successfully for user ${userId} from ${user.email} to ${newEmail}`);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Email address updated successfully",
    });
  } catch (error: any) {
    console.error("Error changing email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to change email address" },
      { status: 500 }
    );
  }
}
