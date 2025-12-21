import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all completed orders
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PAID", "SHIPPED", "COMPLETED"],
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                zone: true,
              },
            },
          },
        },
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Calculate this month's revenue
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthRevenue = orders
      .filter((order) => new Date(order.createdAt) >= startOfMonth)
      .reduce((sum, order) => sum + order.total, 0);

    // Calculate average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Platform fee (10% of total revenue)
    const platformFees = Math.floor(totalRevenue * 0.1);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthStart && orderDate <= monthEnd;
        })
        .reduce((sum, order) => sum + order.total, 0);

      monthlyRevenue.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        revenue: monthRevenue / 100, // Convert cents to dollars
      });
    }

    // Revenue by zone
    const zoneRevenueMap = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const zone = item.product.zone;
        const current = zoneRevenueMap.get(zone) || 0;
        zoneRevenueMap.set(zone, current + item.price * item.quantity);
      });
    });

    const zoneRevenue = Array.from(zoneRevenueMap.entries())
      .map(([zone, amount]) => {
        const zoneNames: Record<string, string> = {
          GAME_ZONE: "🎮 Game Zone",
          FRESH_OUT_WORLD: "👕 Fresh Out World",
          SHOP_4_US: "🧸 Shop 4 Us",
        };
        return {
          zone: zoneNames[zone] || zone,
          amount: amount / 100, // Convert cents to dollars
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Recent transactions (last 10)
    const recentTransactions = orders.slice(0, 10).map((order) => {
      // Get the primary zone from the first item
      const primaryZone = order.items[0]?.product.zone || "UNKNOWN";
      return {
        id: order.id.slice(0, 8),
        user: order.user.username || order.user.email,
        total: order.total / 100, // Convert cents to dollars
        zone: primaryZone,
      };
    });

    return NextResponse.json({
      totalRevenue: totalRevenue / 100,
      thisMonthRevenue: thisMonthRevenue / 100,
      avgOrderValue: avgOrderValue / 100,
      platformFees: platformFees / 100,
      monthlyRevenue,
      zoneRevenue,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}

