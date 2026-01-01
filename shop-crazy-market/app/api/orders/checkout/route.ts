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
  promoCode: z.string().optional(), // Discount code
  discountCents: z.coerce.number().int().nonnegative().default(0), // Applied discount
  storeCreditUsedCents: z.coerce.number().int().nonnegative().default(0), // Store credit used
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

    const { listingId, buyerEmail, itemsSubtotalCents, shippingCents, giftWrapCents, taxCents, promoCode, discountCents, storeCreditUsedCents } = parsed.data;
    const country = (parsed.data.country.toUpperCase() as CountryCode) || "DEFAULT";
    
    // Apply discount if provided
    const finalItemsSubtotalCents = Math.max(0, itemsSubtotalCents - discountCents);
    
    // Get buyer ID from request (if authenticated)
    const buyerId = req.headers.get("x-user-id") || null;
    
    // Validate and deduct store credit if used
    if (storeCreditUsedCents > 0 && buyerId) {
      const user = await prisma.user.findUnique({
        where: { id: buyerId },
        select: { id: true, storeCredit: true },
      });
      
      if (!user) {
        return NextResponse.json(
          { ok: false, message: "User not found" },
          { status: 404 }
        );
      }
      
      const availableCredit = user.storeCredit || 0;
      if (storeCreditUsedCents > availableCredit) {
        return NextResponse.json(
          { ok: false, message: `Insufficient store credit. Available: $${(availableCredit / 100).toFixed(2)}` },
          { status: 400 }
        );
      }
      
      // Deduct store credit from user's account
      await prisma.user.update({
        where: { id: buyerId },
        data: {
          storeCredit: { decrement: storeCreditUsedCents },
        },
      });
      
      console.log(`[CHECKOUT] Deducted ${storeCreditUsedCents} cents store credit from user ${buyerId}`);
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { 
        seller: {
          include: {
            shop: true, // Include shop to check hasAdvertising
          },
        },
      },
    });

    if (!listing) return NextResponse.json({ ok: false, message: "Listing not found" }, { status: 404 });
    if (!listing.isActive) return NextResponse.json({ ok: false, message: "Listing is not active" }, { status: 400 });

    // Seller ads opt-in decides whether to apply 15% ad fee
    // Check shop.hasAdvertising (primary) or fallback to seller.adsEnabled (legacy)
    const adsEnabled = listing.seller.shop?.hasAdvertising ?? listing.seller.adsEnabled ?? false;

    const breakdown = calcOrderBreakdown({
      itemsSubtotalCents: finalItemsSubtotalCents,
      shippingCents,
      giftWrapCents,
      taxCents,
      country,
      adsEnabled,
    });
    
    // Track discount code usage if provided
    if (promoCode) {
      try {
        const promotion = await prisma.deal.findUnique({
          where: { promoCode: promoCode.toUpperCase() },
        });
        
        if (promotion) {
          await prisma.deal.update({
            where: { id: promotion.id },
            data: {
              currentUses: { increment: 1 },
            },
          });
        }
      } catch (error) {
        console.error("Error tracking promo code usage:", error);
        // Don't fail checkout if tracking fails
      }
    }

    // Create order record first (pending)
    const order = await prisma.order.create({
      data: {
        userId: buyerId, // Buyer's user ID if authenticated
        buyerEmail: buyerEmail ?? null,
        sellerId: listing.sellerId,
        listingId: listing.id,
        currency: listing.currency,

        itemsSubtotalCents: finalItemsSubtotalCents,
        shippingCents,
        giftWrapCents,
        taxCents,
        discountCents: discountCents || 0,
        promoCode: promoCode || null,
        storeCreditUsedCents: storeCreditUsedCents || 0,

        orderSubtotalCents: breakdown.orderSubtotalCents,
        // Subtract store credit from order total
        orderTotalCents: Math.max(0, breakdown.orderTotalCents - (storeCreditUsedCents || 0)),

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

    // Calculate final amount to charge (after store credit)
    const finalChargeAmount = Math.max(0, breakdown.orderTotalCents - (storeCreditUsedCents || 0));
    
    // If store credit covers the entire order, mark as paid immediately
    if (finalChargeAmount === 0 && storeCreditUsedCents > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
        },
      });
      
      return NextResponse.json({
        ok: true,
        checkoutUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://shopcrazymarket.com"}/orders/${order.id}?paid=1`,
        orderId: order.id,
        paidWithStoreCredit: true,
      });
    }
    
    // Charge buyer the remaining amount after store credit
    // Enable Apple Pay and Google Pay in addition to card payments
    // Note: Apple Pay and Google Pay are automatically enabled by Stripe when:
    // - payment_method_types includes "card"
    // - The customer's device/browser supports them
    // - The session is properly configured
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // Card enables Apple Pay/Google Pay automatically on supported devices
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: listing.currency,
            product_data: { 
              name: listing.title,
              description: listing.description?.substring(0, 500) || undefined,
            },
            unit_amount: finalChargeAmount, // Charge remaining amount after store credit
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

