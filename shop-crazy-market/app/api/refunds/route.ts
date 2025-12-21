import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// POST /api/refunds - Create a refund
export async function POST(req: Request) {
  try {
    const { orderId, amount, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Get payment intent ID from order
    const paymentIntentId = order.paymentIntentId;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent not found for this order" },
        { status: 400 }
      );
    }

    // Create refund in Stripe
    const refundAmount = amount || order.total;
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount,
      reason: reason || "requested_by_customer",
      metadata: {
        orderId: order.id,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}

// GET /api/refunds - List refunds
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (orderId) {
      // Get refunds for a specific order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order || !order.paymentIntentId) {
        return NextResponse.json([]);
      }

      // Fetch refunds from Stripe
      const refunds = await stripe.refunds.list({
        payment_intent: order.paymentIntentId,
        limit: 100,
      });

      return NextResponse.json(
        refunds.data.map((refund) => ({
          id: refund.id,
          orderId: order.id,
          amount: refund.amount,
          reason: refund.reason || "requested_by_customer",
          status: refund.status,
          createdAt: new Date(refund.created * 1000).toISOString(),
        }))
      );
    }

    // Fetch all disputes from Stripe
    const disputes = await stripe.disputes.list({ limit: 100 });

    // Get orders for disputes
    const disputeOrders = await Promise.all(
      disputes.data.map(async (dispute) => {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          dispute.payment_intent as string
        );
        const order = await prisma.order.findFirst({
          where: { paymentIntentId: paymentIntent.id },
        });
        return {
          id: dispute.id,
          orderId: order?.id || "unknown",
          amount: dispute.amount,
          reason: dispute.reason || "general",
          status: dispute.status,
          createdAt: new Date(dispute.created * 1000).toISOString(),
        };
      })
    );

    return NextResponse.json({
      refunds: [],
      disputes: disputeOrders,
    });
  } catch (error: any) {
    console.error("Error fetching refunds:", error);
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

