import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "thisMonth";

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "thisMonth":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Fetch all fee transactions in the period
    const feeTransactions = await prisma.feeTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            hasAdvertising: true,
          },
        },
      },
    });

    // Fetch listing fees in the period
    const listingFees = await prisma.listingFee.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals
    const totalListingFees = listingFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalTransactionFees = feeTransactions
      .filter((ft) => ft.type === "TRANSACTION")
      .reduce((sum, ft) => sum + ft.amount, 0);
    const totalPaymentProcessingFees = feeTransactions
      .filter((ft) => ft.type === "PAYMENT_PROCESSING")
      .reduce((sum, ft) => sum + ft.amount, 0);
    const totalAdvertisingFees = feeTransactions
      .filter((ft) => ft.type === "ADVERTISING")
      .reduce((sum, ft) => sum + ft.amount, 0);

    const totalRevenue =
      totalListingFees +
      totalTransactionFees +
      totalPaymentProcessingFees +
      totalAdvertisingFees;

    // Group by shop
    const shopMap = new Map<
      string,
      {
        shopId: string;
        shopName: string;
        listingFees: number;
        transactionFees: number;
        paymentProcessingFees: number;
        advertisingFees: number;
        productCount: number;
        hasAdvertising: boolean;
      }
    >();

    // Process listing fees by shop
    listingFees.forEach((fee) => {
      const shopId = fee.product.shop.id;
      const shopName = fee.product.shop.name;
      if (!shopMap.has(shopId)) {
        shopMap.set(shopId, {
          shopId,
          shopName,
          listingFees: 0,
          transactionFees: 0,
          paymentProcessingFees: 0,
          advertisingFees: 0,
          productCount: 0,
          hasAdvertising: false,
        });
      }
      const shop = shopMap.get(shopId)!;
      shop.listingFees += fee.amount;
      shop.productCount += 1;
    });

    // Process fee transactions by shop
    feeTransactions.forEach((ft) => {
      if (!ft.shop) return;
      const shopId = ft.shop.id;
      const shopName = ft.shop.name;
      if (!shopMap.has(shopId)) {
        shopMap.set(shopId, {
          shopId,
          shopName,
          listingFees: 0,
          transactionFees: 0,
          paymentProcessingFees: 0,
          advertisingFees: 0,
          productCount: 0,
          hasAdvertising: ft.shop.hasAdvertising,
        });
      }
      const shop = shopMap.get(shopId)!;
      shop.hasAdvertising = ft.shop.hasAdvertising;

      switch (ft.type) {
        case "TRANSACTION":
          shop.transactionFees += ft.amount;
          break;
        case "PAYMENT_PROCESSING":
          shop.paymentProcessingFees += ft.amount;
          break;
        case "ADVERTISING":
          shop.advertisingFees += ft.amount;
          break;
      }
    });

    const shopBreakdown = Array.from(shopMap.values()).map((shop) => ({
      ...shop,
      totalFees:
        shop.listingFees +
        shop.transactionFees +
        shop.paymentProcessingFees +
        shop.advertisingFees,
    }));

    return NextResponse.json({
      summary: {
        totalListingFees,
        totalTransactionFees,
        totalPaymentProcessingFees,
        totalAdvertisingFees,
        totalRevenue,
        period:
          period === "thisMonth"
            ? "This Month"
            : period === "lastMonth"
            ? "Last Month"
            : "This Year",
      },
      shopBreakdown: shopBreakdown.sort((a, b) => b.totalFees - a.totalFees),
    });
  } catch (error: any) {
    console.error("Error fetching fees:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch fees" },
      { status: 500 }
    );
  }
}

