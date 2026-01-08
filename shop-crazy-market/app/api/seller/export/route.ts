import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/seller/export?type=financial|orders&format=csv&period=30
 * Export financial data or orders as CSV
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "financial"; // "financial" | "orders"
    const format = searchParams.get("format") || "csv";
    const period = parseInt(searchParams.get("period") || "365");
    const shopId = searchParams.get("shopId");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (shopId) {
      const shop = await prisma.shop.findUnique({
        where: { id: shopId, ownerId: userId },
      });
      if (!shop) {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 });
      }
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    if (type === "financial") {
      // Export financial data
      const orders = await prisma.order.findMany({
        where: {
          sellerId: userId,
          createdAt: { gte: startDate },
          paymentStatus: "paid",
        },
        include: {
          listing: {
            select: { id: true, title: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // CSV headers
      const csvHeaders = [
        "Date",
        "Order ID",
        "Listing",
        "Order Total",
        "Platform Fee",
        "Ad Fee",
        "Processing Fee",
        "Total Fees",
        "Seller Payout",
      ];

      const csvRows = orders.map(order => [
        order.createdAt.toISOString().split('T')[0],
        order.id,
        order.listing.title,
        (order.orderTotalCents / 100).toFixed(2),
        (order.platformFeeCents / 100).toFixed(2),
        (order.adFeeCents / 100).toFixed(2),
        (order.processingFeeCents / 100).toFixed(2),
        (order.feesTotalCents / 100).toFixed(2),
        (order.sellerPayoutCents / 100).toFixed(2),
      ]);

      const csv = [
        csvHeaders.join(","),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(",")),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="financial-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (type === "orders") {
      // Export orders data
      const orders = await prisma.order.findMany({
        where: {
          sellerId: userId,
          createdAt: { gte: startDate },
        },
        include: {
          listing: {
            select: { id: true, title: true, priceCents: true },
          },
          user: {
            select: { id: true, username: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const csvHeaders = [
        "Date",
        "Order ID",
        "Listing",
        "Customer Email",
        "Order Total",
        "Payment Status",
        "Shipping Status",
        "Tracking Number",
      ];

      const csvRows = orders.map(order => [
        order.createdAt.toISOString().split('T')[0],
        order.id,
        order.listing.title,
        order.user?.email || order.buyerEmail || "N/A",
        (order.orderTotalCents / 100).toFixed(2),
        order.paymentStatus,
        order.shippingStatus || "N/A",
        order.trackingNumber || "N/A",
      ]);

      const csv = [
        csvHeaders.join(","),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("[EXPORT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export data" },
      { status: 500 }
    );
  }
}
