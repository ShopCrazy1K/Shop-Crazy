import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/listings/[id]/activate
 * Manually check and activate a listing by verifying its Stripe subscription status
 */
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    console.log("[ACTIVATE] Checking listing:", id);

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        feeSubscriptionId: true,
        feeCustomerId: true,
        isActive: true,
        feeSubscriptionStatus: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.isActive) {
      return NextResponse.json({
        success: true,
        message: "Listing is already active",
        isActive: true,
      });
    }

    if (!listing.feeSubscriptionId) {
      return NextResponse.json(
        { error: "No subscription found for this listing" },
        { status: 400 }
      );
    }

    // Fetch subscription status from Stripe
    try {
      const subscription = await stripe.subscriptions.retrieve(listing.feeSubscriptionId);
      const status = subscription.status;
      
      console.log("[ACTIVATE] Subscription status:", status);

      const isActive = status === "active";

      // Update listing
      await prisma.listing.update({
        where: { id },
        data: {
          feeSubscriptionStatus: status,
          isActive: isActive,
        },
      });

      return NextResponse.json({
        success: true,
        isActive: isActive,
        status: status,
        message: isActive 
          ? "Listing has been activated" 
          : `Listing subscription status: ${status}. It will activate when status becomes 'active'.`,
      });
    } catch (stripeError: any) {
      console.error("[ACTIVATE] Stripe error:", stripeError);
      return NextResponse.json(
        { 
          error: "Failed to check subscription status",
          details: stripeError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[ACTIVATE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate listing" },
      { status: 500 }
    );
  }
}

