import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueStoreCredit } from "@/lib/refunds";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/refunds/request
 * Request a refund for an order
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, userId, type, reason } = body as {
      orderId: string;
      userId: string;
      type: "CREDIT" | "CASH";
      reason?: string;
    };

    if (!orderId || !userId || !type) {
      return NextResponse.json(
        { error: "orderId, userId, and type are required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ 
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        sellerId: true,
        paymentStatus: true,
        shippingStatus: true,
        orderTotalCents: true,
        storeCreditUsedCents: true,
        refundStatus: true,
        refundType: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: This order does not belong to you" },
        { status: 403 }
      );
    }

    // Check if order is completed (paid and delivered)
    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: "Order must be paid before requesting a refund" },
        { status: 400 }
      );
    }

    if (order.refundStatus !== "NONE") {
      return NextResponse.json(
        { error: "Refund already requested or processed" },
        { status: 400 }
      );
    }

    // Decide refund amount policy (refund what they paid, minus store credit used)
    // If store credit was used, we should only refund the cash portion
    const refundAmount = order.orderTotalCents - (order.storeCreditUsedCents || 0);

    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: "No refundable amount (order was paid entirely with store credit)" },
        { status: 400 }
      );
    }

    // If CREDIT refund, issue store credit immediately (no Stripe balance required)
    if (type === "CREDIT") {
      try {
        await issueStoreCredit({
          userId: order.userId!,
          sellerId: order.sellerId,
          amount: refundAmount,
          reason: reason || `Refund for Order #${orderId}`,
        });

        // Mark refund as completed immediately for credit refunds
        await prisma.order.update({
          where: { id: orderId },
          data: {
            refundType: type,
            refundStatus: "COMPLETED",
            refundAmount,
            refundReason: reason ?? null,
            refundedAt: new Date(),
          },
        });

        return NextResponse.json({
          ok: true,
          message: "Refund issued as instant store credit. No cash refund required.",
          refundAmount,
          refundType: "CREDIT",
        });
      } catch (error: any) {
        console.error("Error issuing store credit refund:", error);
        return NextResponse.json(
          { error: "Failed to issue store credit refund" },
          { status: 500 }
        );
      }
    }

    // For CASH refunds, mark as REQUESTED (requires admin/seller approval and Stripe processing)
    await prisma.order.update({
      where: { id: orderId },
      data: {
        refundType: type,
        refundStatus: "REQUESTED",
        refundAmount,
        refundReason: reason ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Cash refund requested. Processing may take 3–5 business days.",
      refundAmount,
      refundType: "CASH",
    });
  } catch (error: any) {
    console.error("Error requesting refund:", error);
    return NextResponse.json(
      { error: error.message || "Failed to request refund" },
      { status: 500 }
    );
  }
}

