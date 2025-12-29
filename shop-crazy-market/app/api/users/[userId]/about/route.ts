import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ userId: string }> };

/**
 * GET /api/users/[userId]/about
 * Get user's about section
 */
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { userId } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        about: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error fetching user about:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user info" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[userId]/about
 * Update user's about section (only the user themselves can update)
 */
export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const { userId } = await context.params;
    const body = await req.json();
    const { about } = body;
    const requesterId = req.headers.get("x-user-id");

    if (!requesterId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (requesterId !== userId) {
      return NextResponse.json(
        { error: "You can only update your own about section" },
        { status: 403 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        about: about || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        about: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Error updating user about:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update about section" },
      { status: 500 }
    );
  }
}

