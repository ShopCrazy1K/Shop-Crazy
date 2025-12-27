import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ orderId: string }> };

/**
 * POST /api/orders/[orderId]/check-payment
 * Manually check payment status from Stripe and update order if paid
 */
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { orderId } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user owns this order
    if (order.userId !== userId && order.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // If already paid, return immediately
    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        status: "paid",
        message: "Order is already marked as paid",
        order,
      });
    }

    // Check Stripe session if we have a session ID
    if (order.stripeSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        
        if (session.payment_status === "paid") {
          // Update order to paid
          const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "paid",
              stripePaymentIntent: typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null,
            },
          });

          return NextResponse.json({
            status: "paid",
            message: "Payment confirmed! Order updated.",
            order: updated,
          });
        } else if (session.payment_status === "unpaid") {
          return NextResponse.json({
            status: "unpaid",
            message: "Payment not yet completed",
            order,
          });
        } else {
          return NextResponse.json({
            status: session.payment_status,
            message: `Payment status: ${session.payment_status}`,
            order,
          });
        }
      } catch (stripeError: any) {
        console.error("[CHECK PAYMENT] Stripe error:", stripeError);
        return NextResponse.json(
          { error: "Failed to check Stripe payment status", details: stripeError.message },
          { status: 500 }
        );
      }
    }

    // No session ID, can't check
    return NextResponse.json({
      status: "unknown",
      message: "No Stripe session found for this order",
      order,
    });
  } catch (error: any) {
    console.error("Error checking payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}

