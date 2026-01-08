import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/listings/recently-viewed
 * Get recently viewed listings for a user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      listings: recentlyViewed.map(rv => rv.listing),
    });
  } catch (error: any) {
    console.error("[RECENTLY VIEWED] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch recently viewed" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings/recently-viewed
 * Track a listing view
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    if (userId) {
      const existing = await prisma.recentlyViewed.findFirst({
        where: { userId, listingId },
      });

      if (existing) {
        await prisma.recentlyViewed.update({
          where: { id: existing.id },
          data: { viewedAt: new Date() },
        });
      } else {
        await prisma.recentlyViewed.create({
          data: {
            userId,
            listingId,
            viewedAt: new Date(),
          },
        });
      }
    }

    // Also track in ListingView for analytics
    if (userId) {
      await prisma.listingView.create({
        data: {
          listingId,
          userId,
          viewedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[RECENTLY VIEWED TRACK] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track view" },
      { status: 500 }
    );
  }
}
