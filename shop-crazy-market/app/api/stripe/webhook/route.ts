import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  
  if (!sig) {
    return NextResponse.json(
      { ok: false, message: "Missing signature" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // ✅ Activate listing after subscription checkout completes
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const listingId = session.metadata?.listingId;

      if (listingId) {
        const subscriptionId = typeof session.subscription === "string" 
          ? session.subscription 
          : session.subscription?.id || null;
        const customerId = typeof session.customer === "string"
          ? session.customer
          : session.customer?.id || null;

        console.log("[WEBHOOK] checkout.session.completed for listing:", { 
          listingId, 
          subscriptionId, 
          customerId 
        });

        // Fetch subscription status to determine if we should activate
        let subscriptionStatus = "pending";
        let isActive = false;

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            subscriptionStatus = subscription.status;
            isActive = subscriptionStatus === "active";
            console.log("[WEBHOOK] Subscription status:", subscriptionStatus);
          } catch (err: any) {
            console.error("[WEBHOOK] Error fetching subscription:", err);
            // If we can't fetch, save IDs and let subscription.updated handle activation
          }
        }

        await prisma.listing.update({
          where: { id: listingId },
          data: {
            isActive: isActive,
            feeSubscriptionId: subscriptionId,
            feeCustomerId: customerId,
            feeSubscriptionStatus: subscriptionStatus,
          },
        });

        console.log("[WEBHOOK] Listing updated:", { listingId, isActive });
      }

      // Handle order payments
      if (session.metadata?.type === "order") {
        const orderId = session.metadata.orderId as string;
        const paymentIntent = typeof session.payment_intent === "string" 
          ? session.payment_intent 
          : session.payment_intent?.id || null;

        console.log("[WEBHOOK] Processing order payment:", { 
          orderId, 
          paymentIntent,
          sessionId: session.id,
          amountTotal: session.amount_total,
        });

        try {
          const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
              stripePaymentIntent: paymentIntent,
              paymentStatus: "paid",
            },
          });

          console.log("[WEBHOOK] Order updated successfully:", {
            orderId: updated.id,
            paymentStatus: updated.paymentStatus,
            total: updated.orderTotalCents,
          });
        } catch (error: any) {
          console.error("[WEBHOOK] Error updating order:", {
            orderId,
            error: error.message,
          });
          throw error;
        }
      }
    }

    // 2) Subscription status changes (activate/deactivate listing)
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const sub = event.data.object as any;

      if (sub?.metadata?.type === "listing_fee") {
        const listingId = sub.metadata.listingId as string;
        const status = sub.status as string; // active, past_due, canceled, unpaid, etc.

        await prisma.listing.update({
          where: { id: listingId },
          data: {
            feeSubscriptionStatus: status,
            isActive: status === "active",
          },
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as any;

      if (sub?.metadata?.type === "listing_fee") {
        const listingId = sub.metadata.listingId as string;

        await prisma.listing.update({
          where: { id: listingId },
          data: {
            feeSubscriptionStatus: "canceled",
            isActive: false,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? "Webhook handler failed" }, { status: 500 });
  }
}

