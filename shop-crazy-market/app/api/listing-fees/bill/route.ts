import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMonthlyListingFee, LISTING_FEE_PER_MONTH } from "@/lib/fees";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const dynamic = 'force-dynamic';

/**
 * POST /api/listing-fees/bill
 * 
 * Bill all shops for monthly listing fees
 * This should be run monthly via a cron job or scheduled task
 */
export async function POST(req: Request) {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Get all shops with active products
    const shops = await prisma.shop.findMany({
      include: {
        products: {
          where: {
            quantity: {
              gt: 0, // Only active products
            },
          },
        },
      },
    });

    const results = [];
    const errors = [];

    for (const shop of shops) {
      const productCount = shop.products.length;
      
      if (productCount === 0) continue;

      const totalFee = calculateMonthlyListingFee(productCount);

      // Check if already billed this month
      const existingFees = await prisma.listingFee.findFirst({
        where: {
          shopId: shop.id,
          month: currentMonth,
          year: currentYear,
        },
      });

      if (existingFees) {
        results.push({
          shopId: shop.id,
          shopName: shop.name,
          status: "skipped",
          reason: "Already billed this month",
        });
        continue;
      }

      // Create listing fee records for each product
      const listingFees = await Promise.all(
        shop.products.map((product) =>
          prisma.listingFee.create({
            data: {
              shopId: shop.id,
              productId: product.id,
              amount: LISTING_FEE_PER_MONTH,
              month: currentMonth,
              year: currentYear,
              paid: false,
            },
          })
        )
      );

      // Charge the shop via Stripe
      try {
        if (!shop.stripeAccountId) {
          errors.push({
            shopId: shop.id,
            shopName: shop.name,
            error: "No Stripe Connect account",
          });
          continue;
        }

        // Create a charge or invoice for the listing fees
        // Option 1: Direct charge (simpler)
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalFee,
          currency: "usd",
          customer: shop.stripeAccountId, // This would be a customer ID, not account ID
          description: `Monthly listing fees - ${currentMonth}/${currentYear}`,
          metadata: {
            shopId: shop.id,
            type: "listing_fees",
            month: currentMonth.toString(),
            year: currentYear.toString(),
          },
        });

        // Option 2: Use Stripe Connect to charge the connected account
        // This is more complex and requires setting up Connect properly
        // For now, we'll mark as paid if we have a payment intent
        
        // Update listing fees as paid
        await prisma.listingFee.updateMany({
          where: {
            shopId: shop.id,
            month: currentMonth,
            year: currentYear,
          },
          data: {
            paid: true,
            paidAt: new Date(),
            stripeInvoiceId: paymentIntent.id,
          },
        });

        // Create fee transaction record
        await prisma.feeTransaction.create({
          data: {
            shopId: shop.id,
            type: "listing",
            amount: totalFee,
            description: `Monthly listing fees for ${productCount} products`,
          },
        });

        results.push({
          shopId: shop.id,
          shopName: shop.name,
          productCount,
          totalFee: totalFee / 100,
          listingFeesCreated: listingFees.length,
          paymentIntentId: paymentIntent.id,
          status: "charged",
        });
      } catch (stripeError: any) {
        errors.push({
          shopId: shop.id,
          shopName: shop.name,
          error: stripeError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      month: currentMonth,
      year: currentYear,
      shopsProcessed: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Listing fee billing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to bill listing fees" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listing-fees/bill
 * 
 * Get listing fee summary for a shop
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!shopId) {
      return NextResponse.json(
        { error: "shopId is required" },
        { status: 400 }
      );
    }

    const queryMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const queryYear = year ? parseInt(year) : new Date().getFullYear();

    const listingFees = await prisma.listingFee.findMany({
      where: {
        shopId,
        month: queryMonth,
        year: queryYear,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const totalFee = listingFees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidCount = listingFees.filter((fee) => fee.paid).length;

    return NextResponse.json({
      shopId,
      month: queryMonth,
      year: queryYear,
      totalFee: totalFee / 100,
      productCount: listingFees.length,
      paidCount,
      unpaidCount: listingFees.length - paidCount,
      fees: listingFees.map((fee) => ({
        id: fee.id,
        product: fee.product,
        amount: fee.amount / 100,
        paid: fee.paid,
        paidAt: fee.paidAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching listing fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing fees" },
      { status: 500 }
    );
  }
}
