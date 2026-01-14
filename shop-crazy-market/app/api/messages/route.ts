import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/messages - Get all conversations for the current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all conversations where user is either sender or receiver
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by conversation partner
    const conversationsMap = new Map<string, any>();
    
    // Count unread messages per sender (messages received in last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentReceivedMessages = receivedMessages.filter(
      (msg) => new Date(msg.createdAt) > oneDayAgo
    );
    
    const unreadMap = new Map<string, number>();
    recentReceivedMessages.forEach((msg) => {
      const senderId = msg.senderId;
      unreadMap.set(senderId, (unreadMap.get(senderId) || 0) + 1);
    });

    // Process sent messages
    sentMessages.forEach((msg) => {
      const partnerId = msg.receiverId;
      const key = partnerId;
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          userId: partnerId,
          username: msg.receiver.username || msg.receiver.email,
          lastMessage: msg.content,
          updatedAt: msg.createdAt,
          unreadCount: 0,
          avatar: null,
        });
      } else {
        const conv = conversationsMap.get(key);
        if (msg.createdAt > conv.updatedAt) {
          conv.lastMessage = msg.content;
          conv.updatedAt = msg.createdAt;
        }
      }
    });

    // Process received messages
    receivedMessages.forEach((msg) => {
      const partnerId = msg.senderId;
      const key = partnerId;
      const unreadCount = unreadMap.get(partnerId) || 0;
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          userId: partnerId,
          username: msg.sender.username || msg.sender.email,
          lastMessage: msg.content,
          updatedAt: msg.createdAt,
          unreadCount,
          avatar: null,
        });
      } else {
        const conv = conversationsMap.get(key);
        if (msg.createdAt > conv.updatedAt) {
          conv.lastMessage = msg.content;
          conv.updatedAt = msg.createdAt;
        }
        // Update unread count
        conv.unreadCount = unreadCount;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    // Sort by most recent first
    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content, attachments } = body;

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: "senderId and receiverId are required" },
        { status: 400 }
      );
    }

    // Content or attachments must be provided
    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: "Either content or attachments must be provided" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: content || "",
        attachments: attachments || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the receiver
    try {
      const { notifyNewMessage } = await import("@/lib/notification-helper");
      await notifyNewMessage(
        receiverId,
        message.sender.username || message.sender.email,
        senderId
      );
    } catch (notificationError) {
      // Don't fail the message send if notification creation fails
      console.error("Error creating notification:", notificationError);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

