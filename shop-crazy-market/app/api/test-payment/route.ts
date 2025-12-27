import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Test endpoint to verify payment system configuration
 * GET /api/test-payment
 */
export async function GET() {
  try {
    const checks: Record<string, any> = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Check Stripe configuration
    checks.stripe = {
      secretKey: !!process.env.STRIPE_SECRET_KEY,
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      secretKeyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
    };

    // Test Stripe connection
    try {
      const account = await stripe.accounts.retrieve();
      checks.stripe.connected = true;
      checks.stripe.accountId = account.id;
      checks.stripe.country = account.country;
    } catch (error: any) {
      checks.stripe.connected = false;
      checks.stripe.error = error.message;
    }

    // Check database connection
    try {
      const orderCount = await prisma.order.count();
      checks.database = {
        connected: true,
        orderCount,
      };
    } catch (error: any) {
      checks.database = {
        connected: false,
        error: error.message,
      };
    }

    // Check environment variables
    checks.env = {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "Not set",
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    };

    // Check webhook endpoints
    checks.webhooks = {
      primary: "/api/stripe/webhook",
      secondary: "/api/webhooks/stripe",
      note: "Both endpoints handle order payments. Configure only ONE in Stripe Dashboard.",
    };

    return NextResponse.json({
      status: "ok",
      checks,
      recommendations: [
        checks.stripe.secretKey && checks.stripe.webhookSecret
          ? "✅ Stripe keys are configured"
          : "⚠️ Missing Stripe keys - set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET",
        checks.stripe.connected
          ? "✅ Stripe connection successful"
          : "⚠️ Stripe connection failed - check your STRIPE_SECRET_KEY",
        checks.database.connected
          ? "✅ Database connection successful"
          : "⚠️ Database connection failed - check your DATABASE_URL",
        checks.env.siteUrl !== "Not set"
          ? "✅ Site URL is configured"
          : "⚠️ Set NEXT_PUBLIC_SITE_URL for correct redirect URLs",
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

