import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) return NextResponse.json({ ok: false, message: "Missing stripe-signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    // 1) Listing fee subscription finished / updated
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      if (session?.metadata?.type === "listing_fee") {
        const listingId = session.metadata.listingId as string;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        // Mark listing subscription stored; actual "active" comes from subscription status below
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            feeSubscriptionId: subscriptionId,
            feeCustomerId: customerId,
          },
        });
      }

      if (session?.metadata?.type === "order") {
        const orderId = session.metadata.orderId as string;
        const paymentIntent = session.payment_intent as string;

        await prisma.order.update({
          where: { id: orderId },
          data: {
            stripePaymentIntent: paymentIntent ?? null,
            paymentStatus: "paid",
          },
        });
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

