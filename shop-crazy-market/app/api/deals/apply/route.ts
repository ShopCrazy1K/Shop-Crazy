import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/deals/apply
 * Apply a deal or promo code to a listing
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, dealId, promoCode, itemsSubtotalCents, shopId } = body;

    if (!listingId || itemsSubtotalCents === undefined) {
      return NextResponse.json(
        { error: "listingId and itemsSubtotalCents are required" },
        { status: 400 }
      );
    }

    let deal = null;

    // If dealId is provided, use that
    if (dealId) {
      deal = await prisma.deal.findUnique({
        where: { id: dealId },
        include: {
          listing: {
            select: {
              id: true,
              sellerId: true,
            },
          },
          shop: {
            select: {
              id: true,
              ownerId: true,
            },
          },
        },
      });
    } 
    // If promoCode is provided, find by code
    else if (promoCode) {
      deal = await prisma.deal.findUnique({
        where: { promoCode: promoCode.toUpperCase() },
        include: {
          listing: {
            select: {
              id: true,
              sellerId: true,
            },
          },
          shop: {
            select: {
              id: true,
              ownerId: true,
            },
          },
        },
      });
    }

    if (!deal) {
      return NextResponse.json(
        { error: "Deal or promo code not found" },
        { status: 404 }
      );
    }

    // Check if deal is active
    if (!deal.isActive) {
      return NextResponse.json(
        { error: "This deal is no longer active" },
        { status: 400 }
      );
    }

    // Check date range
    const now = new Date();
    if (now < new Date(deal.startsAt) || now > new Date(deal.endsAt)) {
      return NextResponse.json(
        { error: "This deal has expired or hasn't started yet" },
        { status: 400 }
      );
    }

    // Check usage limits
    if (deal.maxUses && deal.currentUses >= deal.maxUses) {
      return NextResponse.json(
        { error: "This deal has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (deal.minPurchaseCents && itemsSubtotalCents < deal.minPurchaseCents) {
      return NextResponse.json(
        { 
          error: `Minimum purchase of $${(deal.minPurchaseCents / 100).toFixed(2)} required`,
          minPurchaseCents: deal.minPurchaseCents,
        },
        { status: 400 }
      );
    }

    // Check if deal applies to this listing/shop
    if (deal.promotionType === "LISTING" && deal.listingId !== listingId) {
      return NextResponse.json(
        { error: "This deal is not valid for this listing" },
        { status: 400 }
      );
    }

    if (deal.promotionType === "SHOP_WIDE" && shopId && deal.shopId !== shopId) {
      return NextResponse.json(
        { error: "This deal is not valid for this shop" },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountCents = 0;
    if (deal.discountType === "PERCENTAGE") {
      discountCents = Math.round(itemsSubtotalCents * (deal.discountValue / 100));
    } else {
      discountCents = deal.discountValue;
    }

    // Don't allow discount to exceed subtotal
    discountCents = Math.min(discountCents, itemsSubtotalCents);

    return NextResponse.json({
      success: true,
      deal: {
        id: deal.id,
        title: deal.title,
        discountType: deal.discountType,
        discountValue: deal.discountValue,
        promoCode: deal.promoCode,
      },
      discountCents,
      finalTotalCents: itemsSubtotalCents - discountCents,
    });
  } catch (error: any) {
    console.error("Error applying deal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to apply deal" },
      { status: 500 }
    );
  }
}
