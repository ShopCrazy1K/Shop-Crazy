import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ dealId: string }> };

// GET - Get a specific deal
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { dealId } = await context.params;

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deal);
  } catch (error: any) {
    console.error("[API DEALS] Error fetching deal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a deal
export async function DELETE(req: NextRequest, context: Ctx) {
  try {
    const { dealId } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        listing: {
          select: { sellerId: true },
        },
      },
    });

    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404 }
      );
    }

    if (deal.listing.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.deal.delete({
      where: { id: dealId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API DEALS] Error deleting deal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete deal" },
      { status: 500 }
    );
  }
}

