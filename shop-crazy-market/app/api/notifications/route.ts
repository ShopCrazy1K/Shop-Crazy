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

    console.log("[API NOTIFICATIONS GET] Request received:", {
      userId: userId ? `${userId.substring(0, 8)}...` : 'missing',
      hasSearchParams: !!searchParams.get("userId"),
      hasHeader: !!req.headers.get("x-user-id"),
    });

    if (!userId) {
      console.error("[API NOTIFICATIONS GET] Missing userId");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    console.log("[API NOTIFICATIONS GET] Fetching notifications for user:", userId.substring(0, 8) + '...');

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent notifications
    });

    console.log("[API NOTIFICATIONS GET] Found", notifications.length, "notifications");

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        read: false,
      },
    });

    console.log("[API NOTIFICATIONS GET] Unread count:", unreadCount);

    const response = {
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    };

    console.log("[API NOTIFICATIONS GET] Returning response with", response.notifications.length, "notifications");

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[API NOTIFICATIONS GET] Error fetching notifications:", error);
    console.error("[API NOTIFICATIONS GET] Error details:", {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.substring(0, 500),
    });
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete a notification
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const { notificationId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "notificationId is required" },
        { status: 400 }
      );
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: userId, // Ensure user owns this notification
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
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
    let body: any;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error("[API NOTIFICATIONS PUT] Failed to parse request body:", jsonError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { notificationId, markAllRead } = body;

    console.log("[API NOTIFICATIONS PUT] Request received:", {
      userId: userId ? `${userId.substring(0, 8)}...` : 'missing',
      notificationId,
      markAllRead,
    });

    if (!userId) {
      console.error("[API NOTIFICATIONS PUT] Missing userId");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    if (markAllRead) {
      // Mark all notifications as read
      console.log("[API NOTIFICATIONS PUT] Marking all notifications as read for user:", userId.substring(0, 8) + '...');
      const result = await prisma.notification.updateMany({
        where: {
          userId: userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      console.log("[API NOTIFICATIONS PUT] Marked", result.count, "notifications as read");
      return NextResponse.json({ message: "All notifications marked as read", count: result.count });
    } else if (notificationId) {
      // Mark specific notification as read
      console.log("[API NOTIFICATIONS PUT] Marking notification as read:", notificationId);
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

        console.log("[API NOTIFICATIONS PUT] Successfully marked notification as read:", notification.id);
        return NextResponse.json({ success: true, notification });
      } catch (error: any) {
        // If notification not found or doesn't belong to user
        if (error.code === 'P2025') {
          console.error("[API NOTIFICATIONS PUT] Notification not found or access denied:", notificationId);
          return NextResponse.json(
            { error: "Notification not found or access denied" },
            { status: 404 }
          );
        }
        console.error("[API NOTIFICATIONS PUT] Error updating notification:", error);
        throw error;
      }
    } else {
      console.error("[API NOTIFICATIONS PUT] Missing notificationId or markAllRead");
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

