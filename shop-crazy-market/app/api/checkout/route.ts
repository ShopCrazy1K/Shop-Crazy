import Stripe from "stripe";
import { NextResponse } from "next/server";
import { calculateFees } from "@/lib/fees";
import { validateCheckoutItems, validatePrice } from "@/lib/validation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const {
      items,
      shippingTotal = 0,
      giftWrapTotal = 0,
      country = "US",
      hasAdvertising = false,
    } = await req.json();

    // Validate items
    const itemsValidation = validateCheckoutItems(items);
    if (!itemsValidation.valid) {
      return NextResponse.json(
        { error: itemsValidation.error || "Invalid items" },
        { status: 400 }
      );
    }
    
    // Validate shipping and gift wrap totals
    if (shippingTotal < 0 || !validatePrice(shippingTotal)) {
      return NextResponse.json(
        { error: "Invalid shipping total" },
        { status: 400 }
      );
    }
    
    if (giftWrapTotal < 0 || !validatePrice(giftWrapTotal)) {
      return NextResponse.json(
        { error: "Invalid gift wrap total" },
        { status: 400 }
      );
    }

    // Calculate item total
    const itemTotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Calculate fees
    const feeBreakdown = calculateFees({
      itemTotal,
      shippingTotal,
      giftWrapTotal,
      country,
      hasAdvertising,
    });

    // Get userId from request headers (set by frontend after auth)
    const userId = req.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to checkout." },
        { status: 401 }
      );
    }
    
    // Verify user exists in database
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid user. Please log in again." },
        { status: 401 }
      );
    }

    // Build line items including shipping and gift wrap
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      ...items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            metadata: {
              productId: item.productId || "",
            },
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
    ];

    // Add shipping as line item
    if (shippingTotal > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: shippingTotal,
        },
        quantity: 1,
      });
    }

    // Add gift wrap as line item
    if (giftWrapTotal > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Gift Wrap",
          },
          unit_amount: giftWrapTotal,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      metadata: {
        userId,
        itemTotal: itemTotal.toString(),
        shippingTotal: shippingTotal.toString(),
        giftWrapTotal: giftWrapTotal.toString(),
        transactionFee: feeBreakdown.transactionFee.toString(),
        paymentProcessingFee: feeBreakdown.paymentProcessingFee.toString(),
        advertisingFee: feeBreakdown.advertisingFee.toString(),
        sellerPayout: feeBreakdown.sellerPayout.toString(),
        country,
        hasAdvertising: hasAdvertising.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/cart`,
    });

    return NextResponse.json({
      url: session.url,
      feeBreakdown: {
        ...feeBreakdown,
        // Convert to dollars for display
        itemTotal: feeBreakdown.itemTotal / 100,
        shippingTotal: feeBreakdown.shippingTotal / 100,
        giftWrapTotal: feeBreakdown.giftWrapTotal / 100,
        subtotal: feeBreakdown.subtotal / 100,
        transactionFee: feeBreakdown.transactionFee / 100,
        paymentProcessingFee: feeBreakdown.paymentProcessingFee / 100,
        advertisingFee: feeBreakdown.advertisingFee / 100,
        totalFees: feeBreakdown.totalFees / 100,
        sellerPayout: feeBreakdown.sellerPayout / 100,
        platformRevenue: feeBreakdown.platformRevenue / 100,
      },
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

