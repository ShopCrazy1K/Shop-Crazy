import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Get view statistics for admin dashboard
 * Returns daily view counts and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30'); // Default to last 30 days

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get daily view counts
    const dailyViews = await prisma.pageView.groupBy({
      by: ['date'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get today's view count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayViews = await prisma.pageView.count({
      where: {
        date: today,
      },
    });

    // Get total views
    const totalViews = await prisma.pageView.count();

    // Get unique visitors (by unique IP addresses) for today
    const todayUniqueVisitors = await prisma.pageView.groupBy({
      by: ['ipAddress'],
      where: {
        date: today,
        ipAddress: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get online users (users with views in the last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const onlineUsersByIp = await prisma.pageView.groupBy({
      by: ['ipAddress'],
      where: {
        createdAt: {
          gte: fifteenMinutesAgo,
        },
        ipAddress: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get online logged-in users (by userId) active in last 15 minutes
    const onlineLoggedInUsers = await prisma.pageView.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: fifteenMinutesAgo,
        },
        userId: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get most viewed pages
    const topPages = await prisma.pageView.groupBy({
      by: ['path'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Format daily views for easier consumption
    const dailyViewsFormatted = dailyViews.map((view) => ({
      date: view.date.toISOString().split('T')[0],
      count: view._count.id,
    }));

    // Calculate online users (unique IPs + unique user IDs in last 15 minutes)
    // We count unique IPs and unique logged-in users separately, then combine
    const uniqueOnlineIps = new Set(onlineUsersByIp.map(u => u.ipAddress).filter(Boolean));
    const uniqueOnlineUserIds = new Set(onlineLoggedInUsers.map(u => u.userId).filter(Boolean));
    // For logged-in users, we prefer counting by userId over IP to avoid double-counting
    // But we also count unique IPs for anonymous users
    // To get a more accurate count, we'll count:
    // - All unique logged-in users (by userId)
    // - Plus anonymous users (IPs that don't match any logged-in user's recent activity)
    // For simplicity, we'll use the higher of the two counts (IPs or userIds) plus some overlap estimate
    // Actually, let's just count unique IPs as that's more straightforward for "online users"
    const onlineUsersCount = uniqueOnlineIps.size;

    return NextResponse.json({
      ok: true,
      todayViews,
      todayUniqueVisitors: todayUniqueVisitors.length,
      onlineUsers: onlineUsersCount, // Users active in last 15 minutes
      totalViews,
      dailyViews: dailyViewsFormatted,
      topPages: topPages.map((page) => ({
        path: page.path,
        views: page._count.id,
      })),
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[API ADMIN VIEWS] Error fetching view statistics:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to fetch view statistics" },
      { status: 500 }
    );
  }
}