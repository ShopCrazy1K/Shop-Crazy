import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LISTING_FEE_PER_MONTH } from "@/lib/fees";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if fee already paid
    if (listing.feePaid) {
      return NextResponse.json(
        { error: "Listing fee has already been paid" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: LISTING_FEE_PER_MONTH, // $0.20 in cents
            product_data: {
              name: "Listing Fee",
              description: `Monthly listing fee for: ${listing.title}`,
            },
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        listingId: listing.id,
        listingTitle: listing.title,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/listings/${listing.slug}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/listings/${listing.slug}?payment=cancelled`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout error for listing fee:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}


