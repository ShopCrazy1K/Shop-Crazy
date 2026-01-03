import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ listingId: string }> };

/**
 * POST /api/admin/listings/[listingId]
 * Activate, deactivate, or delete a listing (admin only)
 */
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requireAdmin(adminId);

    const { listingId } = await context.params;
    const body = await req.json();
    const { action } = body;

    if (!["activate", "deactivate", "delete"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'activate', 'deactivate', or 'delete'" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (action === "delete") {
      // Delete listing
      await prisma.listing.delete({
        where: { id: listingId },
      });
    } else if (action === "activate") {
      await prisma.listing.update({
        where: { id: listingId },
        data: { isActive: true },
      });
    } else if (action === "deactivate") {
      await prisma.listing.update({
        where: { id: listingId },
        data: { isActive: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Listing ${action}d successfully`,
    });
  } catch (error: any) {
    console.error("Error performing listing action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform action" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

