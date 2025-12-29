import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/users/[userId]/stats
 * Get user statistics (sales count, followers, etc.)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Count paid orders for this seller
    const salesCount = await prisma.order.count({
      where: {
        sellerId: userId,
        paymentStatus: "paid",
      },
    });

    // Count followers
    const followersCount = await prisma.follow.count({
      where: { followingId: userId },
    });

    // Count following
    const followingCount = await prisma.follow.count({
      where: { followerId: userId },
    });

    // Count active listings
    const activeListingsCount = await prisma.listing.count({
      where: {
        sellerId: userId,
        isActive: true,
      },
    });

    // Get average rating from reviews
    const reviews = await prisma.review.findMany({
      where: { sellerId: userId },
      select: { rating: true },
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      salesCount,
      followersCount,
      followingCount,
      activeListingsCount,
      reviewsCount: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    });
  } catch (error: any) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

