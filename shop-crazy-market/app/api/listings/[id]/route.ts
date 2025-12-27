import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    console.log("[API LISTINGS ID] Fetching listing with ID:", id);

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!listing) {
      console.log("[API LISTINGS ID] Listing not found for ID:", id);
      // Try to find by slug as fallback
      const listingBySlug = await prisma.listing.findUnique({
        where: { slug: id },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });
      
      if (listingBySlug) {
        console.log("[API LISTINGS ID] Found listing by slug:", listingBySlug.id);
        return NextResponse.json(listingBySlug);
      }
      
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    console.log("[API LISTINGS ID] Listing found:", listing.id);
    return NextResponse.json(listing);
  } catch (error: any) {
    console.error("[API LISTINGS ID] Error fetching listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

