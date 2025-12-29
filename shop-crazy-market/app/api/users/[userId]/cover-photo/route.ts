import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PUT /api/users/[userId]/cover-photo
 * Update user's cover photo
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { coverPhoto } = body;
    const currentUserId = req.headers.get("x-user-id");

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (currentUserId !== userId) {
      return NextResponse.json(
        { error: "You can only update your own cover photo" },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { coverPhoto: coverPhoto || null },
      select: {
        id: true,
        coverPhoto: true,
      },
    });

    return NextResponse.json({
      success: true,
      coverPhoto: updated.coverPhoto,
    });
  } catch (error: any) {
    console.error("Error updating cover photo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update cover photo" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[userId]/cover-photo
 * Get user's cover photo
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
        coverPhoto: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      coverPhoto: user.coverPhoto,
    });
  } catch (error: any) {
    console.error("Error fetching cover photo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cover photo" },
      { status: 500 }
    );
  }
}

