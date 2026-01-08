import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/users/[userId]/tutorial
 * Check if user has completed tutorial
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const requestUserId = req.headers.get("x-user-id");

    if (requestUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tutorialCompleted: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      tutorialCompleted: user.tutorialCompleted,
    });
  } catch (error: any) {
    console.error("[TUTORIAL GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tutorial status" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[userId]/tutorial
 * Mark tutorial as completed
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const requestUserId = req.headers.get("x-user-id");
    const body = await req.json();
    const { completed } = body;

    if (requestUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "completed must be a boolean" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { tutorialCompleted: completed },
      select: { id: true, tutorialCompleted: true },
    });

    return NextResponse.json({
      ok: true,
      tutorialCompleted: user.tutorialCompleted,
    });
  } catch (error: any) {
    console.error("[TUTORIAL PUT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tutorial status" },
      { status: 500 }
    );
  }
}
