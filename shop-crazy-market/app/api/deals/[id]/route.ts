import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/deals/[id]
 * Update a deal (e.g., toggle active status)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    const deal = await prisma.deal.findUnique({
      where: { id },
    });

    if (!deal) {
      return NextResponse.json(
        { error: "Deal not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : deal.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating deal:", error);
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/deals/[id]
 * Delete a deal
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            sellerId: true,
          },
        },
        shop: {
          select: {
            ownerId: true,
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

    // Verify ownership
    const isOwner = 
      (deal.listing && deal.listing.sellerId === userId) ||
      (deal.shop && deal.shop.ownerId === userId);

    if (!isOwner && userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.deal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}

