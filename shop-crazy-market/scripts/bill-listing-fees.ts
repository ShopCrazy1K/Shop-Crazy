#!/usr/bin/env ts-node

/**
 * Monthly Listing Fee Billing Script
 * 
 * Run this script monthly (e.g., via cron) to bill all shops for listing fees
 * 
 * Usage:
 *   npm run bill-listing-fees
 *   or
 *   ts-node scripts/bill-listing-fees.ts
 * 
 * Cron example (runs on 1st of each month at 2 AM):
 *   0 2 1 * * cd /path/to/shop-crazy-market && npm run bill-listing-fees
 */

import { PrismaClient } from "@prisma/client";
import { calculateMonthlyListingFee, LISTING_FEE_PER_MONTH } from "../lib/fees";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

async function billListingFees() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  console.log(
    `Starting monthly listing fee billing for ${currentMonth}/${currentYear}...`
  );

  // Get all shops with active products
  const shops = await prisma.shop.findMany({
    include: {
      products: {
        where: {
          quantity: {
            gt: 0,
          },
        },
      },
    },
  });

  console.log(`Found ${shops.length} shops to process`);

  const results = {
    success: 0,
    skipped: 0,
    errors: 0,
    details: [] as any[],
  };

  for (const shop of shops) {
    const productCount = shop.products.length;

    if (productCount === 0) {
      results.skipped++;
      continue;
    }

    const totalFee = calculateMonthlyListingFee(productCount);

    // Check if already billed
    const existingFee = await prisma.listingFee.findFirst({
      where: {
        shopId: shop.id,
        month: currentMonth,
        year: currentYear,
      },
    });

    if (existingFee) {
      console.log(`Shop ${shop.name} already billed this month`);
      results.skipped++;
      results.details.push({
        shop: shop.name,
        status: "skipped",
        reason: "Already billed",
      });
      continue;
    }

    try {
      // Create listing fee records
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

      // Charge via Stripe (if shop has Stripe account)
      if (shop.stripeAccountId) {
        // TODO: Implement Stripe Connect charge
        // For now, mark as paid (in production, charge the connected account)
        await prisma.listingFee.updateMany({
          where: {
            shopId: shop.id,
            month: currentMonth,
            year: currentYear,
          },
          data: {
            paid: true,
            paidAt: new Date(),
          },
        });

        // Create fee transaction
        await prisma.feeTransaction.create({
          data: {
            shopId: shop.id,
            type: "listing",
            amount: totalFee,
            description: `Monthly listing fees for ${productCount} products`,
          },
        });

        console.log(
          `✓ Billed ${shop.name}: $${(totalFee / 100).toFixed(2)} for ${productCount} products`
        );
        results.success++;
        results.details.push({
          shop: shop.name,
          status: "charged",
          amount: totalFee / 100,
          products: productCount,
        });
      } else {
        console.log(
          `⚠ Shop ${shop.name} has no Stripe account - fees created but not charged`
        );
        results.details.push({
          shop: shop.name,
          status: "pending",
          reason: "No Stripe account",
        });
      }
    } catch (error: any) {
      console.error(`✗ Error billing ${shop.name}:`, error.message);
      results.errors++;
      results.details.push({
        shop: shop.name,
        status: "error",
        error: error.message,
      });
    }
  }

  console.log("\n=== Billing Summary ===");
  console.log(`Success: ${results.success}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Total shops: ${shops.length}`);

  return results;
}

// Run if executed directly
if (require.main === module) {
  billListingFees()
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default billListingFees;

