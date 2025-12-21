import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    // Get order with shop information
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                shop: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Get fee breakdown from order (now stored directly in order fields)
    const transactionFee = order.transactionFee || 0;
    const paymentProcessingFee = order.paymentProcessingFee || 0;
    const advertisingFee = order.advertisingFee || 0;
    
    // Get shipping from metadata if available
    const orderMetadata = (order.metadata as any) || {};
    const orderShippingTotal = parseInt(orderMetadata.shippingTotal || "0") || 0;

    // Group items by shop to calculate per-shop payouts
    const shopTotals = new Map<string, { itemTotal: number; shippingTotal: number }>();
    const shopAccountIds = new Map<string, string>();
    const shopHasAdvertising = new Map<string, boolean>();

    // Calculate shipping per shop (simplified - in production, calculate based on items)
    const shippingPerShop = order.items.length > 0 
      ? Math.floor(orderShippingTotal / order.items.length)
      : 0;

    order.items.forEach((item) => {
      const shopId = item.product.shopId;
      const shop = item.product.shop;
      
      // Get stripeAccountId and hasAdvertising from shop
      const stripeAccountId = shop.stripeAccountId;
      const hasAdv = shop.hasAdvertising || false;
      
      if (!stripeAccountId) {
        console.error(`Shop ${shopId} has no Stripe Connect account`);
        return;
      }

      const itemTotal = item.price * item.quantity;
      const current = shopTotals.get(shopId) || { itemTotal: 0, shippingTotal: 0 };
      shopTotals.set(shopId, {
        itemTotal: current.itemTotal + itemTotal,
        shippingTotal: current.shippingTotal + shippingPerShop,
      });
      shopAccountIds.set(shopId, stripeAccountId);
      shopHasAdvertising.set(shopId, hasAdv);
    });

    // Calculate and transfer funds to each shop
    const transfers = [];
    const itemTotal = parseInt(orderMetadata.itemTotal || "0") || 0;
    const giftWrapTotal = parseInt(orderMetadata.giftWrapTotal || "0") || 0;
    const totalSubtotal = itemTotal + orderShippingTotal + giftWrapTotal;

    for (const [shopId, totals] of Array.from(shopTotals.entries())) {
      const stripeAccountId = shopAccountIds.get(shopId);
      if (!stripeAccountId) continue;

      const shopSubtotal = totals.itemTotal + totals.shippingTotal;
      const shopPercentage = totalSubtotal > 0 ? shopSubtotal / totalSubtotal : 0;

      // Calculate fees for this shop's portion
      const shopTransactionFee = Math.round(transactionFee * shopPercentage);
      const shopPaymentProcessingFee = Math.round(paymentProcessingFee * shopPercentage);
      const shopAdvertisingFee = shopHasAdvertising.get(shopId)
        ? Math.round(advertisingFee * shopPercentage)
        : 0;

      // Seller payout = shop's subtotal - shop's portion of fees
      const shopPayout = shopSubtotal - shopTransactionFee - shopPaymentProcessingFee - shopAdvertisingFee;

      // Create transfer to connected account
      const transfer = await stripe.transfers.create({
        amount: shopPayout,
        currency: "usd",
        destination: stripeAccountId,
        metadata: {
          orderId: order.id,
          shopId,
          transactionFee: shopTransactionFee.toString(),
          paymentProcessingFee: shopPaymentProcessingFee.toString(),
          advertisingFee: shopAdvertisingFee.toString(),
        },
      });

      transfers.push({
        shopId,
        transferId: transfer.id,
        amount: shopPayout,
        fees: {
          transactionFee: shopTransactionFee,
          paymentProcessingFee: shopPaymentProcessingFee,
          advertisingFee: shopAdvertisingFee,
          total: shopTransactionFee + shopPaymentProcessingFee + shopAdvertisingFee,
        },
      });
    }

    return NextResponse.json({
      success: true,
      transfers,
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process transfer" },
      { status: 500 }
    );
  }
}

