import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/listings/collections?userId=xxx
 * Get collections for a user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId") || userId;

    if (!targetUserId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Only show public collections if viewing another user's
    const isOwner = userId === targetUserId;

    const collections = await prisma.collection.findMany({
      where: {
        userId: targetUserId,
        ...(isOwner ? {} : { isPublic: true }),
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Fetch listings for each collection
    const collectionsWithListings = await Promise.all(
      collections.map(async (collection) => {
        const listings = await prisma.listing.findMany({
          where: {
            id: { in: collection.listingIds },
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
          take: 20, // Limit for performance
        });

        return {
          ...collection,
          listings,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      collections: collectionsWithListings,
    });
  } catch (error: any) {
    console.error("[COLLECTIONS] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings/collections
 * Create a collection
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { name, description, isPublic, listingIds } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        userId,
        name,
        description: description || null,
        isPublic: isPublic || false,
        listingIds: listingIds || [],
      },
    });

    return NextResponse.json({ ok: true, collection });
  } catch (error: any) {
    console.error("[CREATE COLLECTION] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create collection" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/listings/collections?id=xxx
 * Update a collection
 */
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { name, description, isPublic, listingIds } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const collection = await prisma.collection.update({
      where: { id, userId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(listingIds && { listingIds }),
      },
    });

    return NextResponse.json({ ok: true, collection });
  } catch (error: any) {
    console.error("[UPDATE COLLECTION] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update collection" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/collections?id=xxx
 * Delete a collection
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.collection.delete({
      where: { id, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[DELETE COLLECTION] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete collection" },
      { status: 500 }
    );
  }
}
