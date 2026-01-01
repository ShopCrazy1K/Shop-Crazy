import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRefundStatusEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/refunds/reject
 * Reject a refund request (admin/seller only)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, userId, reason } = body as {
      orderId: string;
      userId: string; // Admin or seller ID
      reason: string; // Required reason for rejection
    };

    if (!orderId || !userId || !reason) {
      return NextResponse.json(
        { error: "orderId, userId, and reason are required" },
        { status: 400 }
      );
    }

    // Verify user is admin or seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        sellerId: true,
        buyerEmail: true,
        refundStatus: true,
        refundType: true,
        refundAmount: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization (admin or seller of the order)
    if (user.role !== "ADMIN" && order.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: Only admins or the order seller can reject refunds" },
        { status: 403 }
      );
    }

    // Check refund status
    if (order.refundStatus !== "REQUESTED") {
      return NextResponse.json(
        { error: `Refund is not in REQUESTED status. Current status: ${order.refundStatus}` },
        { status: 400 }
      );
    }

    // Update order with rejection
    await prisma.order.update({
      where: { id: orderId },
      data: {
        refundStatus: "REJECTED",
        refundReason: reason, // Store rejection reason
      },
    });

    // Send email notification
    if (order.buyerEmail) {
      try {
        await sendRefundStatusEmail({
          to: order.buyerEmail,
          orderId: order.id,
          refundType: (order.refundType as "CREDIT" | "CASH") || "CASH",
          refundStatus: "REJECTED",
          refundAmount: order.refundAmount || 0,
          reason: null,
          sellerNote: reason,
        });
      } catch (emailError) {
        console.error("Error sending refund rejection email:", emailError);
      }
    }

    console.log(`[REFUND] Refund rejected for order ${orderId}. Reason: ${reason}`);

    return NextResponse.json({
      ok: true,
      message: "Refund request rejected",
    });
  } catch (error: any) {
    console.error("Error rejecting refund:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject refund" },
      { status: 500 }
    );
  }
}

