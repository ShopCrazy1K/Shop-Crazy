import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendRefundStatusEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/refunds/approve
 * Approve and process a CASH refund (admin/seller only)
 * This requires actual Stripe balance to refund the customer
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, userId } = body as {
      orderId: string;
      userId: string; // Admin or seller ID
    };

    if (!orderId || !userId) {
      return NextResponse.json(
        { error: "orderId and userId are required" },
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
        paymentStatus: true,
        refundStatus: true,
        refundType: true,
        refundAmount: true,
        stripePaymentIntent: true,
        orderTotalCents: true,
        storeCreditUsedCents: true,
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
        { error: "Unauthorized: Only admins or the order seller can approve refunds" },
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

    if (order.refundType !== "CASH") {
      return NextResponse.json(
        { error: "Only CASH refunds require approval. CREDIT refunds are processed instantly." },
        { status: 400 }
      );
    }

    if (!order.stripePaymentIntent) {
      return NextResponse.json(
        { error: "No payment intent found for this order. Cannot process cash refund." },
        { status: 400 }
      );
    }

    // Process Stripe refund (this requires actual Stripe balance)
    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntent,
        amount: order.refundAmount,
        reason: "requested_by_customer",
        metadata: {
          orderId: order.id,
          refundReason: "Approved refund",
        },
      });

      // Update order with refund completion
      await prisma.order.update({
        where: { id: orderId },
        data: {
          refundStatus: "COMPLETED",
          paymentStatus: "refunded",
          refundedAt: new Date(),
        },
      });

      // Send email notification
      if (order.userId) {
        const buyer = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { email: true },
        });
        if (buyer?.email) {
          try {
            await sendRefundStatusEmail({
              to: buyer.email,
              orderId: order.id,
              refundType: "CASH",
              refundStatus: "COMPLETED",
              refundAmount: order.refundAmount,
              reason: null,
            });
          } catch (emailError) {
            console.error("Error sending refund email:", emailError);
          }
        }
      }

      console.log(`[REFUND] Cash refund processed for order ${orderId}. Stripe refund ID: ${refund.id}. Amount: ${order.refundAmount} cents.`);

      return NextResponse.json({
        ok: true,
        message: "Cash refund processed successfully",
        refundId: refund.id,
        refundAmount: order.refundAmount,
        status: refund.status,
      });
    } catch (stripeError: any) {
      console.error("Stripe refund error:", stripeError);
      
      // Update order status to PROCESSING if refund is pending
      if (stripeError.type === "StripeCardError" || stripeError.code === "insufficient_funds") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            refundStatus: "PROCESSING",
          },
        });
      }

      return NextResponse.json(
        { 
          error: "Failed to process Stripe refund",
          details: stripeError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error approving refund:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve refund" },
      { status: 500 }
    );
  }
}

