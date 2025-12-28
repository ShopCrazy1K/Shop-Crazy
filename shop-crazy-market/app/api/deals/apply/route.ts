import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const applyDealSchema = z.object({
  listingId: z.string(),
  promoCode: z.string().optional(),
  dealId: z.string().optional(),
  itemsSubtotalCents: z.number().int().nonnegative(),
});

// POST - Apply a deal/promo code and calculate discount
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = applyDealSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { listingId, promoCode, dealId, itemsSubtotalCents } = parsed.data;
    const now = new Date();

    // Find the deal
    let deal;
    if (dealId) {
      deal = await prisma.deal.findUnique({
        where: { id: dealId },
      });
    } else if (promoCode) {
      deal = await prisma.deal.findUnique({
        where: { promoCode },
      });
    } else {
      // Get the best active deal for this listing
      const deals = await prisma.deal.findMany({
        where: {
          listingId,
          isActive: true,
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
        orderBy: {
          discountValue: "desc",
        },
        take: 1,
      });
      deal = deals[0] || null;
    }

    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found or expired" },
        { status: 404 }
      );
    }

    // Verify deal is active and valid
    if (!deal.isActive || deal.startsAt > now || deal.endsAt < now) {
      return NextResponse.json(
        { error: "Deal is not currently active" },
        { status: 400 }
      );
    }

    // Check usage limits
    if (deal.maxUses && deal.currentUses >= deal.maxUses) {
      return NextResponse.json(
        { error: "Deal has reached maximum uses" },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (deal.minPurchaseCents && itemsSubtotalCents < deal.minPurchaseCents) {
      return NextResponse.json(
        {
          error: `Minimum purchase of $${(deal.minPurchaseCents / 100).toFixed(2)} required`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountCents = 0;
    if (deal.discountType === "PERCENTAGE") {
      discountCents = Math.round((itemsSubtotalCents * deal.discountValue) / 100);
    } else {
      // FIXED_AMOUNT
      discountCents = deal.discountValue;
      // Don't allow discount to exceed item price
      if (discountCents > itemsSubtotalCents) {
        discountCents = itemsSubtotalCents;
      }
    }

    return NextResponse.json({
      success: true,
      deal: {
        id: deal.id,
        title: deal.title,
        discountType: deal.discountType,
        discountValue: deal.discountValue,
      },
      discountCents,
      discountedSubtotalCents: itemsSubtotalCents - discountCents,
    });
  } catch (error: any) {
    console.error("[API DEALS] Error applying deal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to apply deal" },
      { status: 500 }
    );
  }
}

