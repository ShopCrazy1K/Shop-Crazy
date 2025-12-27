import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { userId, shopId } = await req.json();

    if (!userId || !shopId) {
      return NextResponse.json(
        { error: "userId and shopId are required" },
        { status: 400 }
      );
    }

    // Get user email from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify shop belongs to user
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true },
    });

    if (!shop || shop.ownerId !== userId) {
      return NextResponse.json(
        { error: "Shop not found or unauthorized" },
        { status: 403 }
      );
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/connect/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/connect/success`,
      type: "account_onboarding",
    });

    // Store account.id in database linked to shopId
    await prisma.shop.update({
      where: { id: shopId },
      data: { stripeAccountId: account.id },
    });

    return NextResponse.json({
      accountId: account.id,
      url: accountLink.url,
    });
  } catch (error: any) {
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Connect account" },
      { status: 500 }
    );
  }
}

