import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/check-stripe-connect
 * Check if Stripe Connect is enabled on the platform account
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated (you may want to add admin check)
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Method 1: Try to retrieve the platform account
    try {
      const account = await stripe.accounts.retrieve();
      
      // Check if account has Connect enabled by looking at capabilities
      const hasConnect = account.charges_enabled || account.payouts_enabled;
      
      return NextResponse.json({
        enabled: true,
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        country: account.country,
        type: account.type,
        message: "Stripe Connect appears to be enabled",
      });
    } catch (error: any) {
      // If we can't retrieve account, Connect might not be enabled
      console.error("Error retrieving account:", error);
    }

    // Method 2: Try to create a test Express account (this will fail if Connect is not enabled)
    try {
      const testAccount = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: "test@example.com",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // If successful, delete the test account
      await stripe.accounts.del(testAccount.id);

      return NextResponse.json({
        enabled: true,
        message: "Stripe Connect is enabled - test account created and deleted successfully",
      });
    } catch (error: any) {
      console.error("Stripe Connect test error:", error);
      
      // Check for specific error codes that indicate Connect is not enabled
      if (
        error.code === "account_invalid" ||
        error.type === "invalid_request_error" ||
        error.message?.includes("Connect") ||
        error.message?.includes("signed up for Connect") ||
        error.message?.includes("not enabled")
      ) {
        return NextResponse.json({
          enabled: false,
          error: "STRIPE_CONNECT_NOT_ENABLED",
          message: "Stripe Connect is not enabled on this account",
          helpUrl: "https://dashboard.stripe.com/settings/connect",
          errorDetails: error.message,
        });
      }

      // Other errors might indicate different issues
      return NextResponse.json({
        enabled: false,
        error: "UNKNOWN_ERROR",
        message: "Unable to determine Stripe Connect status",
        errorDetails: error.message,
      });
    }
  } catch (error: any) {
    console.error("Error checking Stripe Connect:", error);
    return NextResponse.json(
      {
        enabled: false,
        error: "CHECK_FAILED",
        message: error.message || "Failed to check Stripe Connect status",
      },
      { status: 500 }
    );
  }
}

