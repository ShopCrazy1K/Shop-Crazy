import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ userId: string }> };

/**
 * PUT /api/users/[userId]
 * Update user username
 */
export async function PUT(
  req: NextRequest,
  context: Ctx
) {
  try {
    const { userId } = await context.params;
    const body = await req.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens" },
        { status: 400 }
      );
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username,
        id: { not: userId }, // Exclude current user
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Update username
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Username updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update username" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[userId]
 * Get user information
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        about: true,
        coverPhoto: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

