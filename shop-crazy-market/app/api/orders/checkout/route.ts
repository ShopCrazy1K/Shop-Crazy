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
    
    // Validate store credit if used (but don't deduct yet - wait for payment success)
    if (storeCreditUsedCents > 0 && buyerId) {
      const { getAvailableStoreCredit } = await import("@/lib/store-credit");
      const creditInfo = await getAvailableStoreCredit(buyerId);
      
      if (storeCreditUsedCents > creditInfo.available) {
        return NextResponse.json(
          { ok: false, message: `Insufficient store credit. Available: $${(creditInfo.available / 100).toFixed(2)}` },
          { status: 400 }
        );
      }
      
      console.log(`[CHECKOUT] Validated ${storeCreditUsedCents} cents store credit for user ${buyerId} (will deduct after payment)`);
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
    
    // If store credit covers the entire order, process payment immediately
    if (finalChargeAmount === 0 && storeCreditUsedCents > 0 && buyerId) {
      const { useStoreCredit, awardFirstOrderCredit } = await import("@/lib/store-credit");
      
      // Deduct store credit
      const creditResult = await useStoreCredit(buyerId, storeCreditUsedCents, order.id);
      
      if (!creditResult.success) {
        // Rollback order creation if credit deduction fails
        await prisma.order.delete({ where: { id: order.id } });
        return NextResponse.json(
          { ok: false, message: creditResult.error || "Failed to process store credit" },
          { status: 400 }
        );
      }
      
      // Mark order as paid
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
        },
      });
      
      // Award first order credit if applicable
      if (buyerId) {
        await awardFirstOrderCredit(buyerId, order.id);
      }
      
      return NextResponse.json({
        ok: true,
        checkoutUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://shopcrazymarket.com"}/orders/${order.id}?paid=1`,
        orderId: order.id,
        paidWithStoreCredit: true,
      });
    }
    
    // Check if this is a physical product (has shipping)
    // For now, we'll collect shipping for all products. In the future, you can check listing.digitalFiles.length === 0
    const requiresShipping = true; // You can make this dynamic based on listing type
    
    // Charge buyer the remaining amount after store credit
    // Enable Apple Pay and Google Pay in addition to card payments
    // Note: Apple Pay and Google Pay are automatically enabled by Stripe when:
    // - payment_method_types includes "card"
    // - The customer's device/browser supports them
    // - The session is properly configured
    const sessionConfig: any = {
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
        userId: buyerId || "",
        storeCreditUsedCents: storeCreditUsedCents.toString(), // Store in metadata for webhook
      },
    };

    // Enable shipping address collection for physical products
    if (requiresShipping) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'IE', 'PT', 'GR', 'NZ', 'SG', 'HK', 'JP', 'KR', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'ZA', 'AE', 'IL', 'TR', 'IN', 'TH', 'MY', 'PH', 'ID', 'VN'],
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

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

