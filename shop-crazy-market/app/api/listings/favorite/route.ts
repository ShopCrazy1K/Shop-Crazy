import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/listings/favorite?listingId=xxx
 * Check if listing is favorited
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (listingId) {
      const favorite = await prisma.listingFavorite.findFirst({
        where: {
          userId,
          listingId,
        },
      });
      return NextResponse.json({ ok: true, isFavorited: !!favorite });
    }

    // Get all favorites
    const favorites = await prisma.listingFavorite.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      ok: true,
      favorites: favorites.map(f => f.listing),
    });
  } catch (error: any) {
    console.error("[FAVORITE GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check favorite" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings/favorite
 * Add listing to favorites
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

    const existing = await prisma.listingFavorite.findFirst({
      where: { userId, listingId },
    });
    
    if (!existing) {
      await prisma.listingFavorite.create({
        data: {
          userId,
          listingId,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[FAVORITE ADD] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add favorite" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/favorite?listingId=xxx
 * Remove listing from favorites
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    await prisma.listingFavorite.deleteMany({
      where: { userId, listingId },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[FAVORITE REMOVE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
