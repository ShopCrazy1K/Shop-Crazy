import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shops/[shopId]/promotions
 * Get all promotions for a shop
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const { searchParams } = new URL(req.url);
    const promotionType = searchParams.get("type"); // "SHOP_WIDE", "ABANDONED_CART", "CUSTOM_CODE", or all

    const where: any = {
      shopId,
    };

    if (promotionType) {
      where.promotionType = promotionType;
    }

    const promotions = await prisma.deal.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(promotions);
  } catch (error: any) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shops/[shopId]/promotions
 * Create a new shop-wide promotion or discount code
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const body = await req.json();
    const {
      title,
      description,
      discountType,
      discountValue,
      promoCode,
      promotionType = "SHOP_WIDE", // "SHOP_WIDE", "ABANDONED_CART", "CUSTOM_CODE"
      startsAt,
      endsAt,
      maxUses,
      minPurchaseCents,
      badgeText,
      badgeColor,
      abandonedCartDelayHours,
      listingId, // Optional: for listing-specific shop promotions
    } = body;

    // Validate required fields
    if (!title || !discountType || discountValue === undefined || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate discount value
    if (discountType === "PERCENTAGE" && (discountValue < 1 || discountValue > 100)) {
      return NextResponse.json(
        { error: "Percentage discount must be between 1 and 100" },
        { status: 400 }
      );
    }

    // Check if promo code already exists
    if (promoCode) {
      const existing = await prisma.deal.findUnique({
        where: { promoCode: promoCode.toUpperCase() },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Promo code already exists" },
          { status: 400 }
        );
      }
    }

    // Verify shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    // Create promotion
    const promotion = await prisma.deal.create({
      data: {
        shopId,
        listingId: listingId || null,
        title,
        description: description || null,
        discountType,
        discountValue: parseInt(discountValue.toString()),
        promoCode: promoCode ? promoCode.toUpperCase() : null,
        promotionType,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        maxUses: maxUses ? parseInt(maxUses.toString()) : null,
        minPurchaseCents: minPurchaseCents ? Math.round(parseFloat(minPurchaseCents) * 100) : null,
        badgeText: badgeText || null,
        badgeColor: badgeColor || null,
        abandonedCartDelayHours: abandonedCartDelayHours ? parseInt(abandonedCartDelayHours.toString()) : null,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error: any) {
    console.error("Error creating promotion:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create promotion" },
      { status: 500 }
    );
  }
}

