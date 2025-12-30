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
      },
    });

    return NextResponse.json({
      success: true,
      listings,
    });
  } catch (error: any) {
    console.error("Error fetching featured listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured listings" },
      { status: 500 }
    );
  }
}

