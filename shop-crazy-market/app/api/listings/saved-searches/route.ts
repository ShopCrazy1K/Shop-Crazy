import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/listings/saved-searches
 * Get saved searches for a user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      ok: true,
      searches,
    });
  } catch (error: any) {
    console.error("[SAVED SEARCHES] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch saved searches" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings/saved-searches
 * Save a search
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { name, searchQuery, category, minPrice, maxPrice, productType, sortBy, filters } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const search = await prisma.savedSearch.create({
      data: {
        userId,
        name: name || `Search: ${searchQuery || category || "All"}`,
        searchQuery,
        category,
        minPrice,
        maxPrice,
        productType,
        sortBy,
        filters: filters ? JSON.stringify(filters) : null,
      },
    });

    return NextResponse.json({ ok: true, search });
  } catch (error: any) {
    console.error("[SAVE SEARCH] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save search" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/saved-searches?id=xxx
 * Delete a saved search
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

    await prisma.savedSearch.delete({
      where: { id, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[DELETE SEARCH] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete search" },
      { status: 500 }
    );
  }
}
