import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/messages/[userId] - Get messages between current user and another user
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("currentUserId");
    const otherUserId = params.userId;

    if (!currentUserId) {
      return NextResponse.json(
        { error: "currentUserId is required" },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId,
          },
        ],
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
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transform messages to include fromMe flag
    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      text: msg.content,
      fromMe: msg.senderId === currentUserId,
      createdAt: msg.createdAt,
      sender: msg.sender,
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

