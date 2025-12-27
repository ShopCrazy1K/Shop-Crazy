import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

// POST - Add listing to favorites
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { id: listingId } = await context.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if already favorited (using productId field to store listingId)
    const existing = await prisma.favorite.findFirst({
      where: {
        productId: listingId, // Store listingId in productId field
        userId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Listing already in favorites" },
        { status: 400 }
      );
    }

    // Create favorite (using productId field to store listingId)
    const favorite = await prisma.favorite.create({
      data: {
        productId: listingId, // Store listingId in productId field
        userId,
      },
    });

    return NextResponse.json({ success: true, favorite }, { status: 201 });
  } catch (error: any) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE - Remove listing from favorites
export async function DELETE(req: NextRequest, context: Ctx) {
  try {
    const { id: listingId } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    await prisma.favorite.deleteMany({
      where: {
        productId: listingId, // Store listingId in productId field
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove favorite" },
      { status: 500 }
    );
  }
}

// GET - Check if listing is favorited
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { id: listingId } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { isFavorited: false },
        { status: 200 }
      );
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        productId: listingId, // Store listingId in productId field
        userId,
      },
    });

    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error: any) {
    console.error("Error checking favorite:", error);
    return NextResponse.json(
      { isFavorited: false },
      { status: 200 }
    );
  }
}

