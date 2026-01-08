import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/listings/price-alert
 * Create a price alert
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { listingId, targetPriceCents } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!listingId || !targetPriceCents) {
      return NextResponse.json(
        { error: "listingId and targetPriceCents are required" },
        { status: 400 }
      );
    }

    const alert = await prisma.priceAlert.upsert({
      where: {
        userId_listingId: { userId, listingId },
      },
      create: {
        userId,
        listingId,
        targetPriceCents,
        isActive: true,
      },
      update: {
        targetPriceCents,
        isActive: true,
        notifiedAt: null, // Reset notification when price changes
      },
    });

    return NextResponse.json({ ok: true, alert });
  } catch (error: any) {
    console.error("[PRICE ALERT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create price alert" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listings/price-alert?listingId=xxx
 * Check if user has price alert for listing
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
      const alert = await prisma.priceAlert.findFirst({
        where: {
          userId,
          listingId,
        },
      });
      return NextResponse.json({ ok: true, alert });
    }

    // Get all alerts for user
    const alerts = await prisma.priceAlert.findMany({
      where: { userId, isActive: true },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            priceCents: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, alerts });
  } catch (error: any) {
    console.error("[PRICE ALERT GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch price alerts" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/price-alert?listingId=xxx
 * Delete a price alert
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

    await prisma.priceAlert.deleteMany({
      where: { userId, listingId },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[DELETE PRICE ALERT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete price alert" },
      { status: 500 }
    );
  }
}
