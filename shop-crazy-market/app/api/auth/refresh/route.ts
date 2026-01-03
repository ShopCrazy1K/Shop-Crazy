import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/auth/refresh
 * Refresh user data from database (useful after role changes)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await getUserByEmail(""); // We need to get by ID instead
    
    // Actually, let's use Prisma directly
    const { prisma } = await import("@/lib/prisma");
    const freshUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!freshUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: freshUser,
    });
  } catch (error: any) {
    console.error("Error refreshing user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refresh user" },
      { status: 500 }
    );
  }
}

