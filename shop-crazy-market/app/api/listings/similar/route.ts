import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/listings/similar?listingId=xxx&limit=10
 * Get similar listings based on category and price range
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        category: true,
        priceCents: true,
        sellerId: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Find similar listings (same category, similar price range, exclude same seller)
    const priceRange = listing.priceCents * 0.3; // ±30% price range
    const minPrice = Math.max(0, listing.priceCents - priceRange);
    const maxPrice = listing.priceCents + priceRange;

    const similar = await prisma.listing.findMany({
      where: {
        id: { not: listingId },
        isActive: true,
        sellerId: { not: listing.sellerId },
        category: listing.category || undefined,
        priceCents: {
          gte: minPrice,
          lte: maxPrice,
        },
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
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      ok: true,
      listings: similar,
    });
  } catch (error: any) {
    console.error("[SIMILAR LISTINGS] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch similar listings" },
      { status: 500 }
    );
  }
}
