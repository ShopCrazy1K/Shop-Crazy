import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch listings for this user (seller)
    const listings = await prisma.listing.findMany({
      where: {
        sellerId: userId,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      listings,
      count: listings.length,
    });
  } catch (error: any) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings", details: error.message },
      { status: 500 }
    );
  }
}

