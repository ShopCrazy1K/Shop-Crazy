import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/notifications?userId=USER_ID
 * Get all notifications for a user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent notifications
    });

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications?userId=USER_ID
 * Mark notifications as read
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    if (markAllRead) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ message: "All notifications marked as read" });
    } else if (notificationId) {
      // Mark specific notification as read
      try {
        const notification = await prisma.notification.update({
          where: {
            id: notificationId,
            userId: userId, // Ensure user owns this notification
          },
          data: {
            read: true,
            readAt: new Date(),
          },
        });

        return NextResponse.json({ success: true, notification });
      } catch (error: any) {
        // If notification not found or doesn't belong to user
        if (error.code === 'P2025') {
          return NextResponse.json(
            { error: "Notification not found or access denied" },
            { status: 404 }
          );
        }
        throw error;
      }
    } else {
      return NextResponse.json(
        { error: "notificationId or markAllRead is required" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

