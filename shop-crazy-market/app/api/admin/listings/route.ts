import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/listings
 * Get all listings (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requireAdmin(userId);

    const listings = await prisma.listing.findMany({
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch listings" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

