import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ orderId: string }> };

/**
 * GET /api/orders/[orderId]/verify-payment
 * Verify payment status in Stripe and return detailed payment information
 */
export async function GET(req: NextRequest, context: Ctx) {
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
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            sellerId: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user owns this order (buyer or seller)
    if (order.userId !== userId && order.sellerId !== userId && order.listing.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const paymentInfo: any = {
      orderId: order.id,
      orderStatus: order.paymentStatus,
      orderTotal: order.orderTotalCents,
      stripeSessionId: order.stripeSessionId,
      stripePaymentIntent: order.stripePaymentIntent,
      createdAt: order.createdAt,
    };

    // Check Stripe session if we have a session ID
    if (order.stripeSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId, {
          expand: ['payment_intent'],
        });

        paymentInfo.stripeSession = {
          id: session.id,
          status: session.status,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          currency: session.currency,
          mode: session.mode,
          customerEmail: session.customer_email,
          created: new Date(session.created * 1000).toISOString(),
          paymentIntentId: typeof session.payment_intent === 'string' 
            ? session.payment_intent 
            : session.payment_intent?.id,
        };

        // If we have a payment intent, get more details
        if (paymentInfo.stripeSession.paymentIntentId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              paymentInfo.stripeSession.paymentIntentId
            );

            paymentInfo.paymentIntent = {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              created: new Date(paymentIntent.created * 1000).toISOString(),
              charges: paymentIntent.charges?.data?.map((charge: any) => ({
                id: charge.id,
                amount: charge.amount,
                status: charge.status,
                paid: charge.paid,
                created: new Date(charge.created * 1000).toISOString(),
                receiptUrl: charge.receipt_url,
              })) || [],
            };

            // Check if payment was actually captured
            if (paymentIntent.status === 'succeeded' && paymentIntent.charges?.data?.length > 0) {
              const charge = paymentIntent.charges.data[0];
              paymentInfo.paymentCaptured = charge.paid;
              paymentInfo.chargeId = charge.id;
              paymentInfo.receiptUrl = charge.receipt_url;
            }
          } catch (piError: any) {
            paymentInfo.paymentIntentError = piError.message;
          }
        }
      } catch (sessionError: any) {
        paymentInfo.sessionError = sessionError.message;
      }
    }

    // Determine if payment is actually in Stripe
    paymentInfo.paymentInStripe = !!(
      paymentInfo.stripeSession?.paymentStatus === 'paid' ||
      paymentInfo.paymentIntent?.status === 'succeeded' ||
      paymentInfo.paymentCaptured
    );

    // Check for test/live mode mismatch
    paymentInfo.stripeMode = process.env.STRIPE_SECRET_KEY?.includes('sk_test_') ? 'test' : 'live';

    return NextResponse.json({
      success: true,
      paymentInfo,
      recommendations: [
        !paymentInfo.stripeSessionId 
          ? "⚠️ No Stripe session ID found. Payment may not have been initiated."
          : null,
        !paymentInfo.paymentInStripe && order.paymentStatus === 'paid'
          ? "⚠️ Order marked as paid but payment not found in Stripe. Check webhook logs."
          : null,
        paymentInfo.stripeSession?.paymentStatus === 'unpaid'
          ? "⚠️ Payment session exists but payment is unpaid. Customer may have canceled."
          : null,
        paymentInfo.paymentIntent?.status === 'requires_payment_method'
          ? "⚠️ Payment intent requires payment method. Payment was not completed."
          : null,
      ].filter(Boolean),
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

