import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/users/[userId]/follow
 * Follow a user
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // User to follow
    const followerId = req.headers.get("x-user-id") || new URL(req.url).searchParams.get("followerId");

    if (!followerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (followerId === userId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      );
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      follow,
      message: "Successfully followed user",
    });
  } catch (error: any) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to follow user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[userId]/follow
 * Unfollow a user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // User to unfollow
    const followerId = req.headers.get("x-user-id") || new URL(req.url).searchParams.get("followerId");

    if (!followerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Delete follow relationship
    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unfollowed user",
    });
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unfollow user" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/[userId]/follow
 * Check if current user is following this user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params; // User to check
    const followerId = req.headers.get("x-user-id") || new URL(req.url).searchParams.get("followerId");

    if (!followerId) {
      return NextResponse.json({ isFollowing: false, followersCount: 0, followingCount: 0 });
    }

    // Check if following
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    // Get follower counts
    const followersCount = await prisma.follow.count({
      where: { followingId: userId },
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: userId },
    });

    return NextResponse.json({
      isFollowing: !!isFollowing,
      followersCount,
      followingCount,
    });
  } catch (error: any) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check follow status" },
      { status: 500 }
    );
  }
}

