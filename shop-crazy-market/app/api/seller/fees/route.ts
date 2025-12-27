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
        listing: {
          include: {
            seller: {
              include: {
                shop: true,
              },
            },
          },
        },
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
      // Use new schema fields if available, otherwise fall back to metadata
      const orderSubtotal = order.orderSubtotalCents || 0;
      
      // For legacy orders, calculate from items
      let shopPercentage = 0;
      if (order.items && order.items.length > 0) {
        const shopItems = order.items.filter(
          (item) => item.product.shopId === shopId
        );
        const shopItemTotal = shopItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        shopPercentage = orderSubtotal > 0 ? shopItemTotal / orderSubtotal : 0;
      } else if (order.listing) {
        // For marketplace orders, check if seller owns the shop
        // If the order's sellerId matches the shop owner, it's 100% of this order
        // This is a simplified approach - you may need to adjust based on your business logic
        shopPercentage = 1; // Marketplace orders are typically single-seller
      }

      totalRevenue += Math.round(orderSubtotal * shopPercentage);
      totalTransactionFees +=
        (order.platformFeeCents || 0) * shopPercentage;
      totalPaymentProcessingFees +=
        (order.processingFeeCents || 0) * shopPercentage;
      totalAdvertisingFees +=
        (order.adFeeCents || 0) * shopPercentage;
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

