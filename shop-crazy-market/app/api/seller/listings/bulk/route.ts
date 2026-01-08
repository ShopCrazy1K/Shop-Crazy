import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/seller/listings/bulk
 * Bulk actions on listings (activate, deactivate, delete)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { listingIds, action } = body; // action: "activate" | "deactivate" | "delete"

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json(
        { error: "listingIds array is required" },
        { status: 400 }
      );
    }

    if (!["activate", "deactivate", "delete"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'activate', 'deactivate', or 'delete'" },
        { status: 400 }
      );
    }

    // Verify ownership
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        sellerId: userId,
      },
    });

    if (listings.length !== listingIds.length) {
      return NextResponse.json(
        { error: "Some listings not found or not owned by you" },
        { status: 403 }
      );
    }

    if (action === "delete") {
      await prisma.listing.deleteMany({
        where: {
          id: { in: listingIds },
          sellerId: userId,
        },
      });
    } else {
      await prisma.listing.updateMany({
        where: {
          id: { in: listingIds },
          sellerId: userId,
        },
        data: {
          isActive: action === "activate",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully ${action}d ${listingIds.length} listing(s)`,
    });
  } catch (error: any) {
    console.error("[BULK ACTIONS] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
