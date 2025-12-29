import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/seller/payment-methods
 * Get seller's payment methods for withdrawals
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's shop
    const shop = await prisma.shop.findFirst({
      where: { ownerId: userId },
      select: {
        id: true,
        stripeAccountId: true,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    // If no Stripe Connect account, return empty
    if (!shop.stripeAccountId) {
      return NextResponse.json({
        hasStripeAccount: false,
        paymentMethods: [],
        bankAccounts: [],
      });
    }

    try {
      // Get external account (bank accounts/cards) from Stripe Connect account
      const accounts = await stripe.accounts.listExternalAccounts(
        shop.stripeAccountId,
        { object: "bank_account", limit: 10 }
      );

      const bankAccounts = accounts.data.map((account: any) => ({
        id: account.id,
        bankName: account.bank_name || "Unknown Bank",
        last4: account.last4,
        currency: account.currency,
        defaultForCurrency: account.default_for_currency,
        status: account.status,
      }));

      return NextResponse.json({
        hasStripeAccount: true,
        stripeAccountId: shop.stripeAccountId,
        paymentMethods: [],
        bankAccounts,
      });
    } catch (stripeError: any) {
      console.error("Stripe error fetching payment methods:", stripeError);
      return NextResponse.json(
        { error: "Failed to fetch payment methods from Stripe" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/payment-methods
 * Create Stripe Connect account link for adding payment methods
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's shop
    const shop = await prisma.shop.findFirst({
      where: { ownerId: userId },
      select: {
        id: true,
        stripeAccountId: true,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    let stripeAccountId = shop.stripeAccountId;

    // Create Stripe Connect account if it doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US", // Default to US, can be made configurable
        email: (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      // Update shop with Stripe account ID
      await prisma.shop.update({
        where: { id: shop.id },
        data: { stripeAccountId },
      });
    }

    // Create account link for onboarding or adding payment methods
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/seller/dashboard?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/seller/dashboard?success=true`,
      type: "account_onboarding", // Use "account_update" to update existing account
    });

    return NextResponse.json({
      url: accountLink.url,
      stripeAccountId,
    });
  } catch (error: any) {
    console.error("Error creating payment method link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment method link" },
      { status: 500 }
    );
  }
}

