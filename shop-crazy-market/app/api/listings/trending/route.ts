import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/listings/trending?limit=20&period=7
 * Get trending listings based on views and sales
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const periodDays = parseInt(searchParams.get("period") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get listings with view counts
    const viewCounts = await prisma.listingView.groupBy({
      by: ['listingId'],
      where: {
        viewedAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit * 2, // Get more for filtering
    });

    // Get listings with order counts
    const orderCounts = await prisma.order.groupBy({
      by: ['listingId'],
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'paid',
      },
      _count: { id: true },
    });

    const orderMap = new Map(orderCounts.map(o => [o.listingId, o._count.id]));

    // Calculate trend scores (views * 1 + sales * 10)
    const listingScores = viewCounts.map(v => ({
      listingId: v.listingId,
      views: v._count.id,
      sales: orderMap.get(v.listingId) || 0,
      score: v._count.id + (orderMap.get(v.listingId) || 0) * 10,
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const listingIds = listingScores.map(l => l.listingId);

    // Fetch full listing data
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        isActive: true,
      },
      include: {
        seller: {
          select: { id: true, username: true, email: true },
        },
        deals: {
          where: {
            isActive: true,
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() },
          },
          take: 1,
        },
      },
    });

    // Sort by score
    const sortedListings = listingScores
      .map(score => listings.find(l => l.id === score.listingId))
      .filter(Boolean);

    return NextResponse.json({
      ok: true,
      listings: sortedListings,
      period: periodDays,
    });
  } catch (error: any) {
    console.error("[TRENDING LISTINGS] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch trending listings" },
      { status: 500 }
    );
  }
}
