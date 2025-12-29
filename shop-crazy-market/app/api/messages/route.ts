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
    const conversationsMap = new Map();

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
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          userId: partnerId,
          username: msg.sender.username || msg.sender.email,
          lastMessage: msg.content,
          updatedAt: msg.createdAt,
        });
      } else {
        const conv = conversationsMap.get(key);
        if (msg.createdAt > conv.updatedAt) {
          conv.lastMessage = msg.content;
          conv.updatedAt = msg.createdAt;
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());

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
    const { senderId, receiverId, content } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: "senderId, receiverId, and content are required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
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
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: "message",
          title: "New Message",
          message: `You have a new message from ${message.sender.username || message.sender.email}`,
          link: `/messages/${senderId}`,
        },
      });
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

