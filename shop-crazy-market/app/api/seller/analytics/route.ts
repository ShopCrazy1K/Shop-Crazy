import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/seller/analytics
 * Get comprehensive analytics for seller dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.headers.get("x-user-id");
    const shopId = searchParams.get("shopId");
    const period = searchParams.get("period") || "30"; // days

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!shopId) {
      return NextResponse.json({ error: "shopId is required" }, { status: 400 });
    }

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Verify shop ownership
    const shop = await prisma.shop.findUnique({
      where: { id: shopId, ownerId: userId },
      select: { id: true, ownerId: true },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Get seller's listings
    const listings = await prisma.listing.findMany({
      where: { sellerId: userId },
      select: { id: true, title: true, priceCents: true, isActive: true, createdAt: true },
    });

    // Get orders in period
    const orders = await prisma.order.findMany({
      where: {
        sellerId: userId,
        createdAt: { gte: startDate },
        paymentStatus: "paid",
      },
      select: {
        id: true,
        orderTotalCents: true,
        sellerPayoutCents: true,
        feesTotalCents: true,
        createdAt: true,
        listingId: true,
        userId: true,
        buyerEmail: true,
        listing: { select: { id: true, title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate revenue trends (daily)
    const dailyRevenue: { date: string; revenue: number; orders: number }[] = [];
    const revenueMap = new Map<string, { revenue: number; orders: number }>();

    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const existing = revenueMap.get(date) || { revenue: 0, orders: 0 };
      existing.revenue += order.sellerPayoutCents;
      existing.orders += 1;
      revenueMap.set(date, existing);
    });

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split('T')[0];
      dailyRevenue.push({
        date: dateStr,
        revenue: revenueMap.get(dateStr)?.revenue || 0,
        orders: revenueMap.get(dateStr)?.orders || 0,
      });
    }

    // Top performing listings
    const listingSales = new Map<string, { revenue: number; orders: number; title: string }>();
    orders.forEach(order => {
      const listingId = order.listingId;
      const existing = listingSales.get(listingId) || { revenue: 0, orders: 0, title: order.listing.title };
      existing.revenue += order.sellerPayoutCents;
      existing.orders += 1;
      listingSales.set(listingId, existing);
    });

    const topListings = Array.from(listingSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by category
    const categorySales = new Map<string, { revenue: number; orders: number }>();
    orders.forEach(order => {
      const category = order.listing.category || "Uncategorized";
      const existing = categorySales.get(category) || { revenue: 0, orders: 0 };
      existing.revenue += order.sellerPayoutCents;
      existing.orders += 1;
      categorySales.set(category, existing);
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, o) => sum + o.sellerPayoutCents, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalFees = orders.reduce((sum, o) => sum + o.feesTotalCents, 0);

    // Get listing views (if ListingView model exists)
    const listingViewCounts = await prisma.listingView.groupBy({
      by: ['listingId'],
      where: {
        listingId: { in: listings.map(l => l.id) },
        viewedAt: { gte: startDate },
      },
      _count: { id: true },
    });

    const viewsMap = new Map(listingViewCounts.map(v => [v.listingId, v._count.id]));

    // Active listings with view counts
    const listingsWithViews = listings
      .filter(l => l.isActive)
      .map(l => ({
        ...l,
        views: viewsMap.get(l.id) || 0,
        sales: listingSales.get(l.id)?.orders || 0,
        revenue: listingSales.get(l.id)?.revenue || 0,
      }))
      .sort((a, b) => b.views - a.views);

    // Conversion rates (views to sales)
    const conversionData = listingsWithViews.map(l => ({
      listingId: l.id,
      title: l.title,
      views: l.views,
      sales: l.sales,
      conversionRate: l.views > 0 ? (l.sales / l.views) * 100 : 0,
    }));

    // Repeat customer rate
    const uniqueCustomers = new Set(
      orders.map(o => (o.userId || o.buyerEmail || "")).filter(id => id !== "")
    );
    const repeatCustomers = Array.from(uniqueCustomers).filter(customerId => {
      const customerOrders = orders.filter(
        o => (o.userId === customerId) || (o.buyerEmail === customerId)
      );
      return customerOrders.length > 1;
    });

    const repeatCustomerRate = uniqueCustomers.size > 0
      ? (repeatCustomers.length / uniqueCustomers.size) * 100
      : 0;

    // Recent customers (last 10)
    const recentCustomers = Array.from(uniqueCustomers).slice(0, 10).map((customerId: string) => {
      const customerOrders = orders.filter(
        (o) => (o.userId === customerId) || (o.buyerEmail === customerId)
      );
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.orderTotalCents, 0);
      return {
        userId: customerId,
        orders: customerOrders.length,
        totalSpent,
        lastOrderDate: customerOrders[0]?.createdAt || new Date(),
      };
    });

    return NextResponse.json({
      ok: true,
      period: days,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalFees,
        activeListings: listings.filter(l => l.isActive).length,
        totalListings: listings.length,
      },
      trends: {
        dailyRevenue,
      },
      topListings,
      categorySales: Array.from(categorySales.entries()).map(([category, data]) => ({
        category,
        ...data,
      })),
      listingsWithViews: listingsWithViews.slice(0, 20),
      conversionData: conversionData.slice(0, 20),
      customerMetrics: {
        uniqueCustomers: uniqueCustomers.size,
        repeatCustomers: repeatCustomers.length,
        repeatCustomerRate,
        recentCustomers,
      },
    });
  } catch (error: any) {
    console.error("[SELLER ANALYTICS] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
