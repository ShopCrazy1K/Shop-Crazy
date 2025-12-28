import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Fetch all active deals across all listings (for deals page)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");

    const now = new Date();

    const deals = await prisma.deal.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
        listing: {
          isActive: true,
          ...(category && category !== "all" ? { category } : {}),
        },
      },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        discountValue: "desc",
      },
      take: limit,
    });

    // Filter out deals that have reached max uses
    const availableDeals = deals.filter(
      (deal) => !deal.maxUses || deal.currentUses < deal.maxUses
    );

    return NextResponse.json(availableDeals);
  } catch (error: any) {
    console.error("[API DEALS] Error fetching all deals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

