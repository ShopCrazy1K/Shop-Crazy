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

    // Get the shop to find the owner
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { ownerId: true },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    // Get all orders for this shop's listings this month
    // Orders are linked to listings, and listings have a sellerId
    // We need to match orders where the listing's sellerId matches the shop's ownerId
    const startDate = new Date(queryYear, queryMonth - 1, 1);
    const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        sellerId: shop.ownerId, // Match orders where sellerId matches shop owner
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: "paid", // Only count paid orders
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            sellerId: true,
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
      const orderSubtotal = order.orderSubtotalCents || 0;
      
      // Since we're filtering by sellerId, all orders belong to this shop
      totalRevenue += orderSubtotal;
      totalTransactionFees += order.platformFeeCents || 0;
      totalPaymentProcessingFees += order.processingFeeCents || 0;
      totalAdvertisingFees += order.adFeeCents || 0;
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

