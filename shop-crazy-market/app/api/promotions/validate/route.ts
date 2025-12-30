import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/promotions/validate
 * Validate a discount code and return discount amount
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promoCode, shopId, listingId, subtotalCents } = body;

    if (!promoCode) {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      );
    }

    // Find the promotion by promo code
    const promotion = await prisma.deal.findUnique({
      where: { promoCode: promoCode.toUpperCase() },
      include: {
        shop: {
          select: {
            id: true,
            ownerId: true,
          },
        },
        listing: {
          select: {
            id: true,
            sellerId: true,
          },
        },
      },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: "Invalid promo code" },
        { status: 404 }
      );
    }

    // Check if promotion is active
    if (!promotion.isActive) {
      return NextResponse.json(
        { error: "This promo code is no longer active" },
        { status: 400 }
      );
    }

    // Check date range
    const now = new Date();
    if (now < new Date(promotion.startsAt) || now > new Date(promotion.endsAt)) {
      return NextResponse.json(
        { error: "This promo code has expired or hasn't started yet" },
        { status: 400 }
      );
    }

    // Check usage limits
    if (promotion.maxUses && promotion.currentUses >= promotion.maxUses) {
      return NextResponse.json(
        { error: "This promo code has reached its usage limit" },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (promotion.minPurchaseCents && subtotalCents < promotion.minPurchaseCents) {
      return NextResponse.json(
        { 
          error: `Minimum purchase of $${(promotion.minPurchaseCents / 100).toFixed(2)} required`,
          minPurchaseCents: promotion.minPurchaseCents,
        },
        { status: 400 }
      );
    }

    // Check if promotion applies to this shop/listing
    if (promotion.promotionType === "SHOP_WIDE" && shopId && promotion.shopId !== shopId) {
      return NextResponse.json(
        { error: "This promo code is not valid for this shop" },
        { status: 400 }
      );
    }

    if (promotion.promotionType === "LISTING" && listingId && promotion.listingId !== listingId) {
      return NextResponse.json(
        { error: "This promo code is not valid for this listing" },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountCents = 0;
    if (promotion.discountType === "PERCENTAGE") {
      discountCents = Math.round(subtotalCents * (promotion.discountValue / 100));
    } else {
      discountCents = promotion.discountValue;
    }

    // Don't allow discount to exceed subtotal
    discountCents = Math.min(discountCents, subtotalCents);

    return NextResponse.json({
      valid: true,
      promotion: {
        id: promotion.id,
        title: promotion.title,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
      },
      discountCents,
      finalTotalCents: subtotalCents - discountCents,
    });
  } catch (error: any) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}

