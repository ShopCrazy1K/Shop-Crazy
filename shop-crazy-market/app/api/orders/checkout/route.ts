import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { calcOrderBreakdown, type CountryCode } from "@/lib/fees";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  listingId: z.string().min(1),
  buyerEmail: z.string().email().optional(),
  itemsSubtotalCents: z.coerce.number().int().nonnegative(),
  shippingCents: z.coerce.number().int().nonnegative().default(0),
  giftWrapCents: z.coerce.number().int().nonnegative().default(0),
  taxCents: z.coerce.number().int().nonnegative().default(0),
  country: z.string().default("DEFAULT"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { listingId, buyerEmail, itemsSubtotalCents, shippingCents, giftWrapCents, taxCents } = parsed.data;
    const country = (parsed.data.country.toUpperCase() as CountryCode) || "DEFAULT";

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) return NextResponse.json({ ok: false, message: "Listing not found" }, { status: 404 });
    if (!listing.isActive) return NextResponse.json({ ok: false, message: "Listing is not active" }, { status: 400 });

    // Seller ads opt-in decides whether to apply 15% ad fee
    const adsEnabled = listing.seller.adsEnabled;

    const breakdown = calcOrderBreakdown({
      itemsSubtotalCents,
      shippingCents,
      giftWrapCents,
      taxCents,
      country,
      adsEnabled,
    });

    // Get buyer ID from request (if authenticated)
    const buyerId = req.headers.get("x-user-id") || null;

    // Create order record first (pending)
    const order = await prisma.order.create({
      data: {
        userId: buyerId, // Buyer's user ID if authenticated
        buyerEmail: buyerEmail ?? null,
        sellerId: listing.sellerId,
        listingId: listing.id,
        currency: listing.currency,

        itemsSubtotalCents,
        shippingCents,
        giftWrapCents,
        taxCents,

        orderSubtotalCents: breakdown.orderSubtotalCents,
        orderTotalCents: breakdown.orderTotalCents,

        platformFeeCents: breakdown.platformFeeCents,
        adFeeCents: breakdown.adFeeCents,
        processingFeeCents: breakdown.processingFeeCents,

        feesTotalCents: breakdown.feesTotalCents,
        sellerPayoutCents: breakdown.sellerPayoutCents,

        processingRule: breakdown.processingRule,
        adsEnabledAtSale: breakdown.adsEnabledAtSale,
        
        paymentStatus: "pending", // Will be updated to "paid" by webhook
      },
    });

    // Charge buyer the full orderTotalCents (your fees come out of seller payout in accounting)
    // Enable Apple Pay, Google Pay, and PayPal in addition to card payments
    // Note: Apple Pay and Google Pay are automatically enabled by Stripe when:
    // - payment_method_types includes "card"
    // - The customer's device/browser supports them
    // - The session is properly configured
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "paypal"], // Card enables Apple Pay/Google Pay automatically on supported devices
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: listing.currency,
            product_data: { 
              name: listing.title,
              description: listing.description?.substring(0, 500) || undefined,
            },
            unit_amount: breakdown.orderTotalCents, // total charge
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://shopcrazymarket.com"}/orders/${order.id}?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://shopcrazymarket.com"}/orders/${order.id}?canceled=1`,
      metadata: {
        type: "order",
        orderId: order.id,
        listingId: listing.id,
        sellerId: listing.sellerId,
      },
      // PayPal configuration (optional - PayPal will use customer's locale by default)
      // payment_method_options: {
      //   paypal: {},
      // },
      // Enable automatic payment methods (Apple Pay, Google Pay) - Stripe handles this automatically
      // No additional configuration needed - they appear when device/browser supports them
    });

    console.log("[CHECKOUT] Created Stripe session:", {
      sessionId: session.id,
      orderId: order.id,
      amount: breakdown.orderTotalCents,
      currency: listing.currency,
      paymentIntentId: typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { 
        stripeSessionId: session.id,
        // Store payment intent if available immediately
        stripePaymentIntent: typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id || null,
      },
    });

    return NextResponse.json({ ok: true, checkoutUrl: session.url, orderId: order.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? "Server error" }, { status: 500 });
  }
}

