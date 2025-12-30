import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/shops/my-shop
 * Get the current user's shop, creating it if it doesn't exist
 */
export async function GET(req: NextRequest) {
  try {
    // Try to get userId from header first, then from query params (for compatibility)
    const userId = req.headers.get("x-user-id") || new URL(req.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get or create user's shop
    let shop = await prisma.shop.findFirst({
      where: { ownerId: userId },
    });

    if (!shop) {
      // Create shop if it doesn't exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, username: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      shop = await prisma.shop.create({
        data: {
          name: `${user.username || user.email.split("@")[0]}'s Shop`,
          ownerId: userId,
        },
      });
    }

    return NextResponse.json({ shop });
  } catch (error: any) {
    console.error("Error fetching/creating shop:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch shop" },
      { status: 500 }
    );
  }
}

