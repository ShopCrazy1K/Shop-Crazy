import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ orderId: string }> };

/**
 * POST /api/orders/[orderId]/cancel
 * Cancel a pending order
 */
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { orderId } = await context.params;
    const userId = req.headers.get("x-user-id") || new URL(req.url).searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        sellerId: true,
        paymentStatus: true,
        stripeSessionId: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify the user is the buyer (only buyers can cancel their orders)
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    // Only allow cancellation of pending orders
    if (order.paymentStatus !== "pending") {
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${order.paymentStatus}. Only pending orders can be cancelled.` },
        { status: 400 }
      );
    }

    // Delete the order from the database (since it's pending and not paid, we can safely delete it)
    await prisma.order.delete({
      where: { id: orderId },
    });

    return NextResponse.json({
      message: "Order cancelled and deleted successfully",
      deleted: true,
    });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}

