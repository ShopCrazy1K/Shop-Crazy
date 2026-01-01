import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/listings/featured
 * 
 * Get featured listings for the home page
 * Returns the 4 most recent active listings
 */
export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
      take: 4, // Get 4 listings
      select: {
        id: true,
        title: true,
        priceCents: true,
        images: true,
        slug: true,
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

    // Fetch active deals for each listing
    const now = new Date();
    const listingsWithDeals = await Promise.all(
      listings.map(async (listing) => {
        const shopId = listing.seller?.shop?.id;
        
        // Build where clause to find applicable deals
        const whereClause: any = {
          isActive: true,
          startsAt: { lte: now },
          endsAt: { gte: now },
          OR: [
            { listingId: listing.id },
          ],
        };

        // Add shop-wide deals if shop exists
        if (shopId) {
          whereClause.OR.push({
            shopId: shopId,
            listingId: null,
            promotionType: "SHOP_WIDE",
          });
        }

        // Get the best deal (highest discount)
        const deals = await prisma.deal.findMany({
          where: whereClause,
          orderBy: {
            discountValue: "desc",
          },
          take: 1, // Only get the best deal
          select: {
            id: true,
            title: true,
            discountType: true,
            discountValue: true,
            badgeText: true,
            badgeColor: true,
            endsAt: true,
          },
        });

        return {
          ...listing,
          activeDeal: deals.length > 0 ? deals[0] : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      listings: listingsWithDeals,
    });
  } catch (error: any) {
    console.error("Error fetching featured listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured listings" },
      { status: 500 }
    );
  }
}

