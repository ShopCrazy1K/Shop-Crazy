import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;

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
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error: any) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

