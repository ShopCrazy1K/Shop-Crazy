import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PUT /api/users/[userId]/avatar
 * Update user's avatar/profile picture
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { avatar } = body;
    const currentUserId = req.headers.get("x-user-id");

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (currentUserId !== userId) {
      return NextResponse.json(
        { error: "You can only update your own avatar" },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatar || null },
      select: {
        id: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      avatar: updated.avatar,
    });
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update avatar" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[userId]/avatar
 * Get user's avatar
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
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      avatar: user.avatar,
    });
  } catch (error: any) {
    console.error("Error fetching avatar:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}