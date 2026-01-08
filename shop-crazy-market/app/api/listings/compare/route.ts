import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/listings/compare
 * Get listings in comparison for a user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const limit = 4; // Max 4 comparisons

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comparisons = await prisma.productComparison.findMany({
      where: { userId },
      include: {
        listing: {
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
        },
      },
      orderBy: { addedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      comparisons: comparisons.map(c => ({
        id: c.id,
        listing: c.listing,
        addedAt: c.addedAt,
      })),
    });
  } catch (error: any) {
    console.error("[COMPARE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch comparisons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings/compare
 * Add listing to comparison
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { listingId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    // Check current count
    const currentCount = await prisma.productComparison.count({
      where: { userId },
    });

    if (currentCount >= 4) {
      return NextResponse.json(
        { error: "Maximum 4 items can be compared at once" },
        { status: 400 }
      );
    }

    // Check if already added
    const existing = await prisma.productComparison.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (existing) {
      return NextResponse.json({ ok: true, message: "Already in comparison" });
    }

    await prisma.productComparison.create({
      data: {
        userId,
        listingId,
        addedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[COMPARE ADD] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add to comparison" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/compare
 * Remove listing from comparison
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const comparisonId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (comparisonId) {
      await prisma.productComparison.deleteMany({
        where: { id: comparisonId, userId },
      });
    } else if (listingId) {
      await prisma.productComparison.deleteMany({
        where: { userId, listingId },
      });
    } else {
      return NextResponse.json({ error: "listingId or id required" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[COMPARE REMOVE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove from comparison" },
      { status: 500 }
    );
  }
}
