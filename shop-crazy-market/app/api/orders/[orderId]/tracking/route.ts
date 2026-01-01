import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardFirstOrderCredit } from "@/lib/store-credit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PUT /api/orders/[orderId]/tracking
 * Update order tracking information (seller only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { carrier, trackingNumber, shippingStatus } = body;
    const sellerId = req.headers.get("x-user-id");

    if (!sellerId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify order exists and seller owns it
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        sellerId: true,
        userId: true,
        paymentStatus: true,
        shippingStatus: true,
        shippedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.sellerId !== sellerId) {
      return NextResponse.json(
        { error: "You can only update tracking for your own orders" },
        { status: 403 }
      );
    }

    // Update tracking info
    const updateData: any = {};
    if (carrier !== undefined) updateData.trackingCarrier = carrier || null;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || null;
    if (shippingStatus !== undefined) {
      updateData.shippingStatus = shippingStatus || null;
      if (shippingStatus === "shipped" && !order.shippedAt) {
        updateData.shippedAt = new Date();
      }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Award welcome credit if order is marked as delivered and user has completed their first order
    if (shippingStatus === "delivered" && order.userId && order.paymentStatus === "paid") {
      // Check if this is the first time this order is being marked as delivered
      if (order.shippingStatus !== "delivered") {
        try {
          await awardFirstOrderCredit(order.userId);
        } catch (error) {
          console.error("Error awarding first order credit:", error);
          // Don't fail the request if credit awarding fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error: any) {
    console.error("Error updating tracking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tracking" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[orderId]/tracking
 * Get order tracking information
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        sellerId: true,
        userId: true,
        trackingCarrier: true,
        trackingNumber: true,
        shippingStatus: true,
        shippedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user is buyer or seller
    if (order.userId !== userId && order.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      trackingCarrier: order.trackingCarrier,
      trackingNumber: order.trackingNumber,
      shippingStatus: order.shippingStatus,
      shippedAt: order.shippedAt,
    });
  } catch (error: any) {
    console.error("Error fetching tracking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tracking" },
      { status: 500 }
    );
  }
}

