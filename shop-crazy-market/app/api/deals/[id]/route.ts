import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/deals/[id]
 * Get a specific deal
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deal = await prisma.deal.findUnique({
      where: { id },
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
        shop: {
          select: {
            id: true,
            name: true,
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

    return NextResponse.json(deal);
  } catch (error: any) {
    console.error("[API DEALS] Error fetching deal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/deals/[id]
 * Update a deal (full edit support)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
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

    // Build update data from request body
    const updateData: any = {};

    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.description !== undefined) {
      updateData.description = body.description || null;
    }

    if (body.discountType !== undefined) {
      updateData.discountType = body.discountType;
    }

    if (body.discountValue !== undefined) {
      updateData.discountValue = parseInt(body.discountValue.toString());
    }

    if (body.promoCode !== undefined) {
      updateData.promoCode = body.promoCode ? body.promoCode.toUpperCase() : null;
    }

    if (body.startsAt !== undefined) {
      updateData.startsAt = new Date(body.startsAt);
    }

    if (body.endsAt !== undefined) {
      updateData.endsAt = new Date(body.endsAt);
    }

    if (body.maxUses !== undefined) {
      updateData.maxUses = body.maxUses ? parseInt(body.maxUses.toString()) : null;
    }

    if (body.minPurchaseCents !== undefined) {
      updateData.minPurchaseCents = body.minPurchaseCents ? Math.round(parseFloat(body.minPurchaseCents) * 100) : null;
    }

    if (body.badgeText !== undefined) {
      updateData.badgeText = body.badgeText || null;
    }

    if (body.badgeColor !== undefined) {
      updateData.badgeColor = body.badgeColor || null;
    }

    if (body.abandonedCartDelayHours !== undefined) {
      updateData.abandonedCartDelayHours = body.abandonedCartDelayHours ? parseInt(body.abandonedCartDelayHours.toString()) : null;
    }

    if (body.listingId !== undefined) {
      updateData.listingId = body.listingId || null;
    }

    // Validate dates if both are provided
    if (updateData.startsAt && updateData.endsAt) {
      if (updateData.endsAt <= updateData.startsAt) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    } else if (updateData.startsAt && deal.endsAt) {
      if (deal.endsAt <= updateData.startsAt) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    } else if (updateData.endsAt && deal.startsAt) {
      if (updateData.endsAt <= deal.startsAt) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Validate discount value
    const discountValue = updateData.discountValue !== undefined ? updateData.discountValue : deal.discountValue;
    const discountType = updateData.discountType !== undefined ? updateData.discountType : deal.discountType;
    
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    // Check if promo code is unique (if being changed)
    if (updateData.promoCode !== undefined && updateData.promoCode) {
      const existing = await prisma.deal.findUnique({
        where: { promoCode: updateData.promoCode },
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "Promo code already exists" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.deal.update({
      where: { id },
      data: updateData,
    });

    console.log("[API DEALS] Updated deal:", {
      id: updated.id,
      title: updated.title,
      isActive: updated.isActive,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating deal:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update deal" },
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

