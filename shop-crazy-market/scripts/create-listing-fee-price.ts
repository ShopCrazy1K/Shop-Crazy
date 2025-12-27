/**
 * Script to create a Stripe Price for listing fees ($0.20/month)
 * 
 * Run: npx tsx scripts/create-listing-fee-price.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env file
config({ path: resolve(process.cwd(), ".env") });

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

async function createListingFeePrice() {
  try {
    console.log("Creating Stripe Price for listing fee ($0.20/month)...");

    // Create a Product first
    const product = await stripe.products.create({
      name: "Listing Fee",
      description: "Monthly listing fee for Shop Crazy Market",
    });

    console.log("✅ Product created:", product.id);

    // Create a recurring Price for $0.20/month
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 20, // $0.20 in cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });

    console.log("\n✅ Listing Fee Price created successfully!");
    console.log("\n📋 Add this to Vercel Environment Variables:");
    console.log(`   Key: STRIPE_LISTING_FEE_PRICE_ID`);
    console.log(`   Value: ${price.id}`);
    console.log("\n🔗 Vercel: https://vercel.com/dashboard");
    console.log("   → Your Project → Settings → Environment Variables");

    return price.id;
  } catch (error: any) {
    console.error("❌ Error creating price:", error.message);
    if (error.message?.includes("API key")) {
      console.error("\n💡 Make sure STRIPE_SECRET_KEY is set in your .env file");
    }
    process.exit(1);
  }
}

createListingFeePrice();

