import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/seller/fees
 * 
 * Get fee summary for a seller's shop
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

    const now = new Date();
    const queryMonth = month ? parseInt(month) : now.getMonth() + 1;
    const queryYear = year ? parseInt(year) : now.getFullYear();

    // Get all orders for this shop's products this month
    const startDate = new Date(queryYear, queryMonth - 1, 1);
    const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              shopId,
            },
          },
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate fees from orders
    let totalRevenue = 0;
    let totalTransactionFees = 0;
    let totalPaymentProcessingFees = 0;
    let totalAdvertisingFees = 0;

    orders.forEach((order) => {
      const orderMetadata = (order as any).metadata || {};
      const orderItemTotal = parseInt(orderMetadata.itemTotal || "0") || 0;
      const orderShipping = parseInt(orderMetadata.shippingTotal || "0") || 0;
      const orderGiftWrap = parseInt(orderMetadata.giftWrapTotal || "0") || 0;
      const orderSubtotal = orderItemTotal + orderShipping + orderGiftWrap;

      // Calculate shop's portion of this order
      const shopItems = order.items.filter(
        (item) => item.product.shopId === shopId
      );
      const shopItemTotal = shopItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shopPercentage =
        orderSubtotal > 0 ? shopItemTotal / orderSubtotal : 0;

      totalRevenue += Math.round(orderSubtotal * shopPercentage);
      totalTransactionFees +=
        (order.transactionFee || 0) * shopPercentage;
      totalPaymentProcessingFees +=
        (order.paymentProcessingFee || 0) * shopPercentage;
      totalAdvertisingFees +=
        (order.advertisingFee || 0) * shopPercentage;
    });

    // Get listing fees for this month
    const listingFees = await prisma.listingFee.findMany({
      where: {
        shopId,
        month: queryMonth,
        year: queryYear,
      },
    });

    const totalListingFees = listingFees.reduce(
      (sum, fee) => sum + fee.amount,
      0
    );

    const totalFees =
      totalListingFees +
      totalTransactionFees +
      totalPaymentProcessingFees +
      totalAdvertisingFees;

    const netPayout = totalRevenue - totalFees;

    return NextResponse.json({
      month: queryMonth,
      year: queryYear,
      totalRevenue,
      totalListingFees,
      totalTransactionFees,
      totalPaymentProcessingFees,
      totalAdvertisingFees,
      totalFees,
      netPayout,
    });
  } catch (error: any) {
    console.error("Error fetching seller fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee summary" },
      { status: 500 }
    );
  }
}

