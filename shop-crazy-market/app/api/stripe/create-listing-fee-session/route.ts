import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json(
        { ok: false, message: "Listing ID is required" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { 
        id: true,
        sellerId: true,
        isActive: true,
        feeSubscriptionStatus: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { ok: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if listing already has an active subscription
    if (listing.isActive && listing.feeSubscriptionStatus === "active") {
      return NextResponse.json(
        { ok: false, message: "Listing already has an active subscription" },
        { status: 400 }
      );
    }

    const LISTING_FEE_PRICE_ID = process.env.STRIPE_LISTING_FEE_PRICE_ID || process.env.STRIPE_LISTING_PRICE_ID;
    
    if (!LISTING_FEE_PRICE_ID) {
      return NextResponse.json(
        { ok: false, message: "Missing STRIPE_LISTING_FEE_PRICE_ID in environment variables" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://shopcrazymarket.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ 
        price: LISTING_FEE_PRICE_ID, 
        quantity: 1 
      }],
      success_url: `${baseUrl}/listings/${listingId}?fee=success`,
      cancel_url: `${baseUrl}/listings/${listingId}?fee=cancel`,
      metadata: {
        type: "listing_fee", // Important for webhook handler
        listingId: listingId,
        sellerId: listing.sellerId,
      },
      subscription_data: {
        metadata: {
          type: "listing_fee",
          listingId: listingId,
          sellerId: listing.sellerId,
        },
      },
    });

    console.log("[CREATE LISTING FEE SESSION] Created session:", {
      sessionId: session.id,
      listingId,
      url: session.url,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error: any) {
    console.error("[CREATE LISTING FEE SESSION] Error:", error);
    return NextResponse.json(
      { ok: false, message: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

