import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const createDealSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().int().positive(),
  promoCode: z.string().optional().nullable(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  maxUses: z.number().int().positive().optional().nullable(),
  minPurchaseCents: z.number().int().nonnegative().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  badgeColor: z.string().optional().nullable(),
});

type Ctx = { params: Promise<{ id: string }> };

// GET - Fetch all deals for a listing
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { id: listingId } = await context.params;
    const now = new Date();

    console.log("[API LISTINGS DEALS] Fetching deals for listing:", listingId);
    console.log("[API LISTINGS DEALS] Current time:", now.toISOString());

    // Fetch deals that apply to this listing:
    // 1. Direct listing deals (listingId matches)
    // 2. Shop-wide deals (shopId matches, listingId is null)
    // Both must be active and within date range
    
    // First, get the listing to find its shop
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { 
        sellerId: true,
        seller: {
          select: {
            shop: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const shopId = listing.seller?.shop?.id;

    console.log("[API LISTINGS DEALS] Listing info:", {
      listingId,
      sellerId: listing.sellerId,
      shopId: shopId || "No shop found",
    });

    // First, let's check ALL deals for this listing (for debugging)
    const allDealsForListing = await prisma.deal.findMany({
      where: {
        OR: [
          { listingId: listingId },
          { shopId: shopId || undefined },
        ],
      },
    });

    console.log("[API LISTINGS DEALS] All deals (no filters):", allDealsForListing.length);
    allDealsForListing.forEach((deal, index) => {
      console.log(`[API LISTINGS DEALS] Deal ${index + 1} (unfiltered):`, {
        id: deal.id,
        title: deal.title,
        listingId: deal.listingId,
        shopId: deal.shopId,
        promotionType: deal.promotionType,
        isActive: deal.isActive,
        startsAt: deal.startsAt.toISOString(),
        endsAt: deal.endsAt.toISOString(),
        now: now.toISOString(),
        startsAtValid: deal.startsAt <= now,
        endsAtValid: deal.endsAt >= now,
      });
    });

    // Build where clause to find applicable deals
    const whereClause: any = {
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
      OR: [
        // Direct listing deals (including LISTING promotion type)
        { listingId: listingId },
      ],
    };

    // Add shop-wide deals if shop exists
    if (shopId) {
      whereClause.OR.push({
        shopId: shopId,
        listingId: null, // Shop-wide deals have null listingId
        promotionType: "SHOP_WIDE",
      });
    }


    console.log("[API LISTINGS DEALS] Where clause:", JSON.stringify(whereClause, null, 2));

    const deals = await prisma.deal.findMany({
      where: whereClause,
      orderBy: {
        discountValue: "desc", // Show best deals first
      },
    });

    console.log("[API LISTINGS DEALS] Found deals:", deals.length);
    deals.forEach((deal, index) => {
      console.log(`[API LISTINGS DEALS] Deal ${index + 1}:`, {
        id: deal.id,
        title: deal.title,
        listingId: deal.listingId,
        shopId: deal.shopId,
        promotionType: deal.promotionType,
        isActive: deal.isActive,
        startsAt: deal.startsAt.toISOString(),
        endsAt: deal.endsAt.toISOString(),
      });
    });

    return NextResponse.json(deals);
  } catch (error: any) {
    console.error("[API DEALS] Error fetching deals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

// POST - Create a new deal
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { id: listingId } = await context.params;
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Verify listing exists and user owns it
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - you don't own this listing" },
        { status: 403 }
      );
    }

    // Validate deal data
    const parsed = createDealSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate discount value
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    // Validate dates
    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);
    if (endsAt <= startsAt) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check if promo code is unique (if provided)
    if (data.promoCode) {
      const existing = await prisma.deal.findUnique({
        where: { promoCode: data.promoCode },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Promo code already exists" },
          { status: 400 }
        );
      }
    }

    // Create deal
    const deal = await prisma.deal.create({
      data: {
        listingId,
        title: data.title,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        promoCode: data.promoCode || null,
        startsAt,
        endsAt,
        maxUses: data.maxUses || null,
        minPurchaseCents: data.minPurchaseCents || null,
        badgeText: data.badgeText || null,
        badgeColor: data.badgeColor || null,
        isActive: true,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error: any) {
    console.error("[API DEALS] Error creating deal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create deal" },
      { status: 500 }
    );
  }
}

